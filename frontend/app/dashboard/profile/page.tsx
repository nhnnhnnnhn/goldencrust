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
import { getTranslation } from "@/utils/translations"
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
  const [language, setLanguage] = useState<"en" | "vi">("en")
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

  // Listen for language changes
  useEffect(() => {
    // Get initial language
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "vi")) {
        setLanguage(e.newValue)
      }
    }

    // Listen for custom language change event (from same tab)
    const handleLanguageChange = (e: CustomEvent<"en" | "vi">) => {
      setLanguage(e.detail)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("languageChange", handleLanguageChange as EventListener)
    }
  }, [])

  const t = getTranslation(language)

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'fullName':
        if (!value) return t.profile.validation.fullNameRequired
        if (value.length < 3 || value.length > 50) return t.profile.validation.fullNameLength
        if (!/^[a-zA-Z\s]+$/.test(value)) return t.profile.validation.fullNameLetters
        return ""
      case 'email':
        if (!value) return t.profile.validation.emailRequired
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.profile.validation.emailInvalid
        return ""
      case 'phone':
        if (!value) return t.profile.validation.phoneRequired
        if (!/^\d{10}$/.test(value)) return t.profile.validation.phoneLength
        return ""
      case 'address':
        if (!value) return t.profile.validation.addressRequired
        if (value.length < 3 || value.length > 100) return t.profile.validation.addressLength
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
      return t.profile.validation.passwordLength
    }
    if (!/[A-Z]/.test(password)) {
      return t.profile.validation.passwordUppercase
    }
    if (!/[a-z]/.test(password)) {
      return t.profile.validation.passwordLowercase
    }
    if (!/[0-9]/.test(password)) {
      return t.profile.validation.passwordNumber
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return t.profile.validation.passwordSpecial
    }
    return ""
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    const errors = {
      currentPassword: !passwordData.currentPassword ? t.profile.validation.currentPasswordRequired : "",
      newPassword: validatePassword(passwordData.newPassword),
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword ? t.profile.validation.passwordMatch : ""
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
            toast.error(t.profile.validation.passwordInvalid)
          }
        } else {
          toast.error(t.profile.validation.passwordInvalid)
        }
      } else if (error.status === 401) {
        // Show the specific error message from the server
        const errorMessage = error.data?.message || t.profile.validation.currentPasswordIncorrect
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
        toast.error(t.profile.validation.passwordPermission, {
          duration: 5000,
          position: "top-right",
        })
      } else if (error.status === 500) {
        toast.error(t.profile.validation.passwordServer, {
          duration: 5000,
          position: "top-right",
        })
      } else {
        // Handle any other error cases
        const errorMessage = error.data?.message || error.message || t.profile.validation.passwordFailed
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
          <p className="mt-4 text-gray-600">{t.profile.loading}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.profile.errorTitle}</h2>
          <p className="text-gray-600 mb-4">{t.profile.errorMessage}</p>
          <Button onClick={() => refetch()}>{t.profile.errorButton}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.profile.title}</h1>
        <p className="mt-2 text-gray-600">{t.profile.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t.profile.tabs.profile}</TabsTrigger>
          <TabsTrigger value="password">{t.profile.tabs.password}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile.sections.profileInfo}</CardTitle>
              <CardDescription>{t.profile.sections.profileInfoDesc}</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.profile.fields.fullName}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t.profile.placeholders.fullName}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.profile.fields.email}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.profile.placeholders.email}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t.profile.fields.phone}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.profile.placeholders.phone}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t.profile.fields.address}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t.profile.placeholders.address}
                  />
                  {validationErrors.address && (
                    <p className="text-sm text-red-500">{validationErrors.address}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? t.profile.buttons.updating : t.profile.buttons.updateProfile}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile.sections.changePassword}</CardTitle>
              <CardDescription>{t.profile.sections.changePasswordDesc}</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.profile.fields.currentPassword}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder={t.profile.placeholders.currentPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.currentPassword && (
                    <p className="text-sm text-red-500">{validationErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.profile.fields.newPassword}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder={t.profile.placeholders.newPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.newPassword && (
                    <p className="text-sm text-red-500">{validationErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.profile.fields.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder={t.profile.placeholders.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? t.profile.buttons.changing : t.profile.buttons.changePassword}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.profile.dialogs.successTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.profile.dialogs.profileUpdateSuccess}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              {t.profile.dialogs.ok}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Success Dialog */}
      <AlertDialog open={showPasswordSuccessDialog} onOpenChange={setShowPasswordSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.profile.dialogs.successTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.profile.dialogs.passwordUpdateSuccess}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPasswordSuccessDialog(false)}>
              {t.profile.dialogs.ok}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Confirm Dialog */}
      <AlertDialog open={showPasswordConfirmDialog} onOpenChange={setShowPasswordConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.profile.dialogs.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.profile.dialogs.passwordConfirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPasswordConfirmDialog(false)}>
              {t.profile.dialogs.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordConfirm}>
              {t.profile.dialogs.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
