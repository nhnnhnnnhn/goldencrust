"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useChangeUserPasswordMutation, User } from "@/redux/api/userApi"
import { toast } from "sonner"
import { Toaster } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showPasswordSuccessDialog, setShowPasswordSuccessDialog] = useState(false)
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({})

  // Get user profile data
  const { 
    data: profileData,
    isLoading,
    error,
    refetch
  } = useGetUserProfileQuery(undefined)

  // Update profile mutation
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()

  // Change password mutation
  const [changePassword, { isLoading: isChangingPassword }] = useChangeUserPasswordMutation()

  const [formData, setFormData] = useState<Partial<User>>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  })

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      })
    }
  }, [profileData])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'fullName':
        if (!value) return "Full name is required"
        if (value.length < 3 || value.length > 50) return "Full name must be 3-50 characters long"
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Full name must contain only letters"
        return ""
      case 'email':
        if (!value) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format"
        return ""
      case 'phone':
        if (!value) return "Phone number is required"
        if (!/^\d{10}$/.test(value)) return "Phone number must be exactly 10 digits"
        return ""
      case 'address':
        if (!value) return "Address is required"
        if (value.length < 3 || value.length > 100) return "Address must be 3-100 characters long"
        return ""
      default:
        return ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate the field and update validation errors
    const error = validateField(name, value)
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const errors = {
      fullName: validateField('fullName', formData.fullName || ''),
      email: validateField('email', formData.email || ''),
      phone: validateField('phone', formData.phone || ''),
      address: validateField('address', formData.address || '')
    }
    
    setValidationErrors(errors)
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error)) {
      return
    }

    try {
      const updateData = {
        fullName: formData.fullName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        address: formData.address?.trim()
      }

      const response = await updateProfile(updateData).unwrap()
      if (response) {
        console.log('Profile update response:', response)
        // Update the auth context with new user data
        if (user) {
          // Keep existing user data and update only what changed
          login(
            formData.fullName || user.fullName, // Use the form data or existing name
            formData.email || user.email,
            user.role,
            user.loyaltyPoints,
            user.joinDate
          )
        }
        setShowSuccessDialog(true)
        refetch()
      }
    } catch (error: any) {
      console.error('Profile update error:', {
        status: error.status,
        data: error.data,
        message: error.data?.message || error.message
      })

      if (error.status === 400) {
        const errorMessage = error.data?.message || "Invalid input data. Please check your information."
        toast.error(errorMessage)
      } else if (error.status === 401) {
        toast.error("Your session has expired. Please log in again.")
      } else if (error.status === 403) {
        toast.error("You don't have permission to update this profile.")
      } else if (error.status === 409) {
        const errorMessage = error.data?.message || "This email or phone number is already in use."
        toast.error(errorMessage)
      } else if (error.status === 500) {
        toast.error("Server error. Please try again later.")
      } else {
        const errorMessage = error.data?.message || error.message || "Failed to update profile. Please try again."
        toast.error(errorMessage)
      }
    }
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Include at least one uppercase letter (A-Z)"
    }
    if (!/[a-z]/.test(password)) {
      return "Include at least one lowercase letter (a-z)"
    }
    if (!/[0-9]/.test(password)) {
      return "Include at least one number (0-9)"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Include at least one special character (!@#$%^&*(),.?\":{}|<>)"
    }
    return ""
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    const errors = {
      currentPassword: !passwordData.currentPassword ? "Please enter your current password" : "",
      newPassword: validatePassword(passwordData.newPassword),
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword ? "New passwords do not match" : ""
    }
    
    setValidationErrors(errors)
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error)) {
      return
    }

    setShowPasswordConfirmDialog(true)
  }

  const handlePasswordConfirm = async () => {
    try {
      console.log('Sending password update request:', {
        oldPassword: passwordData.currentPassword ? '***' : undefined,
        newPassword: passwordData.newPassword ? '***' : undefined
      })

      const response = await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap()

      console.log('Password update response:', response)
      setShowPasswordSuccessDialog(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error('Password update error details:', {
        status: error.status,
        data: error.data,
        message: error.data?.message || error.message
      })

      // Handle specific error cases
      if (error.status === 400) {
        if (error.data?.message) {
          toast.error(error.data.message)
        } else if (error.data?.errors && typeof error.data.errors === 'object') {
          // Handle validation errors from the server
          const errorMessages = Object.values(error.data.errors)
            .flat()
            .filter((msg): msg is string => typeof msg === 'string')
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0])
          } else {
            toast.error("Invalid password format. Please check the requirements.")
          }
        } else {
          toast.error("Invalid password format. Please check the requirements.")
        }
      } else if (error.status === 401) {
        // Show the specific error message from the server
        const errorMessage = error.data?.message || "Current password is incorrect"
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
        })
        // Clear only the current password field
        setPasswordData(prev => ({
          ...prev,
          currentPassword: ""
        }))
      } else if (error.status === 403) {
        toast.error("You don't have permission to change the password", {
          duration: 5000,
          position: "top-right",
        })
      } else if (error.status === 500) {
        toast.error("Server error. Please try again later", {
          duration: 5000,
          position: "top-right",
        })
      } else {
        // Handle any other error cases
        const errorMessage = error.data?.message || error.message || "Failed to update password. Please try again."
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">There was a problem loading your profile information.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.fullName ? "border-red-500" : ""}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.address ? "border-red-500" : ""}
                  />
                  {validationErrors.address && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.address}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isUpdating || Object.values(validationErrors).some(error => error)}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className={validationErrors.currentPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className={validationErrors.newPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.newPassword}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Your password must include:
                  </p>
                  <ul className="list-disc list-inside mt-1 ml-2 text-sm text-gray-500">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className={validationErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-xl font-semibold">
                Profile Updated Successfully!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-500 mt-2">
                Your profile information has been updated successfully.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogAction
                onClick={() => setShowSuccessDialog(false)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Change Success Dialog */}
      <AlertDialog open={showPasswordSuccessDialog} onOpenChange={setShowPasswordSuccessDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-xl font-semibold">
                Password Updated Successfully!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-500 mt-2">
                Your password has been changed successfully. Please use your new password the next time you log in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogAction
                onClick={() => setShowPasswordSuccessDialog(false)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Change Confirmation Dialog */}
      <AlertDialog open={showPasswordConfirmDialog} onOpenChange={setShowPasswordConfirmDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your password? You will need to use your new password the next time you log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPasswordConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowPasswordConfirmDialog(false)
                handlePasswordConfirm()
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
