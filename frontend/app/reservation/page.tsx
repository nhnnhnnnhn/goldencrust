"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { useGetRestaurantsQuery } from '@/redux/api'
import { useGetTablesByRestaurantQuery } from '@/redux/api/tableApi'
import { useCreateReservationMutation } from '@/redux/api/reservationApi'
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

import styles from "./styles.module.css"

// Define restaurant status type
type RestaurantStatus = 'open' | 'closed'

export default function ReservationPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    time: "",
    guests: "",
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Remove selectedRestaurant state and use formData.location instead
  const { data: currentRestaurantTables = [] } = useGetTablesByRestaurantQuery(
    formData.location || '',
    { skip: !formData.location }
  )

  // Calculate available tables for current restaurant
  const availableTablesCount = Array.isArray(currentRestaurantTables) 
    ? currentRestaurantTables.filter(table => table.status === 'available').length 
    : 0

  // Get available tables that match the guest count
  const availableTables = Array.isArray(currentRestaurantTables) 
    ? currentRestaurantTables.filter(table => 
        table.status === 'available' && 
        table.capacity >= parseInt(formData.guests || "0")
      )
    : []

  // Get all tables for the selected restaurant, sorted by table number
  const restaurantTables = Array.isArray(currentRestaurantTables) 
    ? currentRestaurantTables
        .filter(table => !table.deleted)
        .sort((a, b) => a.tableNumber.localeCompare(b.tableNumber))
    : []

  // Calculate total seats from selected tables
  const totalSelectedSeats = restaurantTables
    .filter(table => selectedTables.includes(table._id))
    .reduce((sum, table) => sum + table.capacity, 0)

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-red-100 text-red-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'occupied':
        return 'Occupied'
      case 'reserved':
        return 'Reserved'
      default:
        return 'Unknown'
    }
  }

  // Check if user is logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/reservation")
    } else if (user) {
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phone: prev.phone
      }))
    }
  }, [user, isLoading, router])

  const validateName = (name: string) => {
    if (!name) return 'Name is required'
    if (name.length < 2) return 'Name must be at least 2 characters'
    if (!/^[\p{L}\s]*$/u.test(name)) return 'Name can only contain letters and spaces'
    return ''
  }

  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number is required'
    if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be 10 digits'
    return ''
  }

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
    return ''
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })

    // Validate on change
    if (field === 'name') {
      setFormErrors(prev => ({ ...prev, name: validateName(value) }))
    } else if (field === 'phone') {
      setFormErrors(prev => ({ ...prev, phone: validatePhone(value) }))
    } else if (field === 'email') {
      setFormErrors(prev => ({ ...prev, email: validateEmail(value) }))
    }
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.location || !formData.date || !formData.time || !formData.guests) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setStep(2)
  }

  const handleTableSelect = (tableId: string) => {
    const requiredSeats = parseInt(formData.guests || "0")
    const maxAllowedSeats = requiredSeats + 4 // Maximum 4 extra seats allowed

    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        // Deselect table
        return prev.filter(id => id !== tableId)
      } else {
        // Calculate new total seats if this table is added
        const newTotal = restaurantTables
          .filter(table => [...prev, tableId].includes(table._id))
          .reduce((sum, table) => sum + table.capacity, 0)

        // Only allow selection if total seats won't exceed max allowed
        if (newTotal <= maxAllowedSeats) {
          return [...prev, tableId]
        } else {
          toast({
            title: "Warning",
            description: `Cannot select this table. Total seats would exceed maximum allowed (${requiredSeats} guests + 4 extra seats)`,
            variant: "destructive",
          })
          return prev
        }
      }
    })
  }

  const handleTableContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTables.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        variant: "destructive",
      })
      return
    }
    
    const requiredSeats = parseInt(formData.guests || "0")
    if (totalSelectedSeats < requiredSeats - 1) { // Allow 1 seat less than required
      toast({
        title: "Error",
        description: "Selected tables don't have enough seats",
        variant: "destructive",
      })
      return
    }
    setStep(3)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setSelectedTables([]) // Clear selected tables when going back
    } else if (step === 3) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const nameError = validateName(formData.name)
    const phoneError = validatePhone(formData.phone)
    const emailError = validateEmail(formData.email)

    setFormErrors({
      name: nameError,
      phone: phoneError,
      email: emailError
    })

    if (nameError || phoneError || emailError) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Validate form data
      if (!formData.location || !formData.date || !formData.time || !formData.guests || !formData.name || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Create reservation
      const result = await createReservation({
        customerName: formData.name,
        customerPhone: formData.phone,
        reservationDate: format(new Date(formData.date), 'yyyy-MM-dd'),
        reservationTime: formData.time,
        numberOfGuests: parseInt(formData.guests),
        specialRequests: formData.specialRequests,
        restaurantId: formData.location,
      }).unwrap()

      // Show success message
      toast({
        title: "Success",
        description: "Your reservation has been created successfully",
      })

      setIsSubmitted(true)
    } catch (error: any) {
      // Show error message
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create reservation",
        variant: "destructive",
      })
    }
  }

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00"
  ]

  // Helper function to check if a time is in the past
  const isTimeInPast = (date: Date, timeStr: string) => {
    const now = new Date()
    const [hours, minutes] = timeStr.split(':').map(Number)
    const selectedDateTime = new Date(date)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    return selectedDateTime < now
  }

  // Show loading state while checking authentication or loading restaurants
  if (isLoading || isLoadingRestaurants || isCreating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
      </div>
    )
  }

  // If not logged in, the useEffect will redirect to login page
  if (!user) return null

  return (
    <div className={styles.container}>
      {/* Background elements */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.backgroundCircle}></div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <ChevronLeft className={styles.backIcon} />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className={styles.headerCenter}>
          <Link href="/" className={styles.logo}>
            GOLDEN CRUST
          </Link>
        </div>
        <div className={styles.headerRight}></div>
      </header>

      <main className={styles.main}>
        {!isSubmitted ? (
          <>
            <div className={styles.pageTitle}>
              <h1>Table Reservation</h1>
              <div className={styles.decorativeLine}></div>
              <p>Experience the art of dining at our Michelin-starred restaurant</p>
            </div>

            <div className={styles.formContainer}>
              <div className={styles.progressIndicator}>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepCircle} ${step >= 1 ? styles.activeStep : ""}`}>1</div>
                  <span className={styles.stepLabel}>Select</span>
                </div>
                <div className={`${styles.progressLine} ${step >= 2 ? styles.activeLine : ""}`}></div>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepCircle} ${step >= 2 ? styles.activeStep : ""}`}>2</div>
                  <span className={styles.stepLabel}>Table</span>
                </div>
                <div className={`${styles.progressLine} ${step >= 3 ? styles.activeLine : ""}`}></div>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepCircle} ${step >= 3 ? styles.activeStep : ""}`}>3</div>
                  <span className={styles.stepLabel}>Details</span>
                </div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleContinue}>
                  <div className={styles.formStep}>
                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Select a Location</h2>
                      <div className={styles.locationGrid}>
                        {restaurants.map((restaurant) => (
                          <div
                            key={restaurant._id}
                            className={`${styles.locationCard} ${
                              formData.location === restaurant._id ? styles.selectedLocation : ""
                            }`}
                            onClick={() => handleInputChange("location", restaurant._id)}
                          >
                            <div className={styles.locationIcon}>
                              <MapPin />
                            </div>
                            <div className={styles.locationInfo}>
                              <h3>{restaurant.name}</h3>
                              <p>{restaurant.address}</p>
                              <div className={styles.locationDetails}>
                                <span className={`${styles.statusBadge} ${restaurant.status === 'closed' ? styles.statusClosed : styles.statusOpen}`}>
                                  {restaurant.status === 'closed' ? 'Closed' : 'Open'}
                                </span>
                                <span className={styles.tableCount}>
                                  {formData.location === restaurant._id ? availableTablesCount : '...'} tables available
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={styles.datePickerButton}>
                              <Calendar className={styles.inputIcon} />
                              {formData.date ? format(new Date(formData.date), "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={styles.calendarPopover}>
                            <CalendarComponent
                              mode="single"
                              selected={formData.date ? new Date(formData.date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  handleInputChange("date", format(date, "yyyy-MM-dd"))
                                }
                              }}
                              initialFocus
                              disabled={(date) => {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                return date < today
                              }}
                              className={styles.calendar}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time</label>
                        <Select 
                          onValueChange={(value) => handleInputChange("time", value)}
                          value={formData.time}
                        >
                          <SelectTrigger className={styles.selectTrigger}>
                            <SelectValue placeholder="Select time">
                              <div className={styles.selectDisplay}>
                                <Clock className={styles.inputIcon} />
                                {formData.time || "Select time"}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className={styles.selectContent}>
                            {timeSlots.map((time) => {
                              const isDisabled = !!(formData.date && 
                                format(new Date(formData.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && 
                                isTimeInPast(new Date(formData.date), time))
                              
                              return (
                                <SelectItem 
                                  key={time} 
                                  value={time} 
                                  className={styles.selectItem}
                                  disabled={isDisabled}
                                >
                                  {time}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of Guests</label>
                      <Select 
                        value={formData.guests} 
                        onValueChange={(value) => handleInputChange("guests", value)}
                      >
                        <SelectTrigger className={styles.selectTrigger}>
                          <SelectValue placeholder="Select number of guests">
                            <div className={styles.selectDisplay}>
                              <Users className={styles.inputIcon} />
                              {formData.guests ? `${formData.guests} guests` : "Select number of guests"}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className={styles.selectContent}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()} className={styles.selectItem}>
                              {num} {num === 1 ? "guest" : "guests"}
                            </SelectItem>
                          ))}
                          <SelectItem value="more" className={styles.selectItem}>
                            More than 10 (specify in notes)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className={styles.formActions}>
                      <Button
                        type="submit"
                        className={styles.continueButton}
                        disabled={!formData.location || !formData.date || !formData.time || !formData.guests}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleTableContinue}>
                  <div className={styles.formStep}>
                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Select Table(s)</h2>
                      <p className={styles.sectionDescription}>
                        Select one or more tables for {formData.guests} guests at {restaurants.find(r => r._id === formData.location)?.name}
                      </p>
                      <div className={styles.selectionSummary}>
                        <p>Selected: {selectedTables.length} table(s)</p>
                        <p>Total seats: {totalSelectedSeats}</p>
                        <p className={
                          totalSelectedSeats >= parseInt(formData.guests || "0") - 1 && 
                          totalSelectedSeats <= parseInt(formData.guests || "0") + 4 
                            ? styles.validCapacity 
                            : styles.invalidCapacity
                        }>
                          {totalSelectedSeats >= parseInt(formData.guests || "0") 
                            ? totalSelectedSeats <= parseInt(formData.guests || "0") + 4
                              ? "✓ Good fit" 
                              : "⚠ Too many seats selected"
                            : totalSelectedSeats >= parseInt(formData.guests || "0") - 1
                              ? "⚠ One seat less but acceptable"
                              : "✗ Not enough seats"}
                        </p>
                      </div>

                      <div className={styles.tableGrid}>
                        {restaurantTables.length === 0 ? (
                          <div className={styles.noTables}>
                            <p>No tables found at this restaurant.</p>
                            <p>Please try a different location.</p>
                          </div>
                        ) : (
                          restaurantTables.map((table) => {
                            const isAvailable = table.status === 'available'
                            const wouldExceedLimit = isAvailable && 
                              !selectedTables.includes(table._id) &&
                              (totalSelectedSeats + table.capacity) > (parseInt(formData.guests || "0") + 4)

                            return (
                              <div
                                key={table._id}
                                className={`${styles.tableCard} 
                                  ${selectedTables.includes(table._id) ? styles.selectedTable : ""}
                                  ${!isAvailable || wouldExceedLimit ? styles.disabledTable : ""}
                                `}
                                onClick={() => isAvailable && !wouldExceedLimit && handleTableSelect(table._id)}
                              >
                                <div className={styles.tableHeader}>
                                  <h3>Table {table.tableNumber}</h3>
                                  <span className={`${styles.tableStatus} ${getTableStatusColor(table.status)}`}>
                                    {getTableStatusText(table.status)}
                                  </span>
                                </div>
                                <div className={styles.tableInfo}>
                                  <span className={styles.tableCapacity}>
                                    <Users className={styles.tableIcon} />
                                    {table.capacity} seats
                                  </span>
                                  {!isAvailable ? (
                                    <p className={styles.tableWarning}>
                                      Table not available
                                    </p>
                                  ) : wouldExceedLimit ? (
                                    <p className={styles.tableWarning}>
                                      Would exceed maximum seats
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <Button type="button" variant="outline" className={styles.backButton} onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={styles.continueButton}
                        disabled={selectedTables.length === 0 || totalSelectedSeats < parseInt(formData.guests || "0") - 1}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formStep}>
                    <div className={styles.reservationSummary}>
                      <h2 className={styles.summaryTitle}>Reservation Details</h2>
                      <div className={styles.summaryContent}>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Location:</span>
                          <span className={styles.summaryValue}>
                            {restaurants.find((restaurant) => restaurant._id === formData.location)?.name}
                          </span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Date:</span>
                          <span className={styles.summaryValue}>{formData.date ? format(new Date(formData.date), "PPP") : ""}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Time:</span>
                          <span className={styles.summaryValue}>{formData.time}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Guests:</span>
                          <span className={styles.summaryValue}>{formData.guests}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Selected Tables:</span>
                          <span className={styles.summaryValue}>
                            <div className={styles.selectedTablesInfo}>
                              {restaurantTables
                                .filter(table => selectedTables.includes(table._id))
                                .map((table, index, array) => (
                                  <span key={table._id}>
                                    Table {table.tableNumber} ({table.capacity} seats)
                                    {index < array.length - 1 ? ', ' : ''}
                                  </span>
                                ))
                              }
                              <div className={styles.totalSeats}>
                                Total: {totalSelectedSeats} seats
                              </div>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Contact Information</h2>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Full Name</label>
                          <Input
                            className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
                            placeholder="Enter your full name"
                            value={user?.fullName || formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                          {formErrors.name && (
                            <span className={styles.errorMessage}>{formErrors.name}</span>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Phone Number</label>
                          <Input
                            className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            required
                          />
                          {formErrors.phone && (
                            <span className={styles.errorMessage}>{formErrors.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <Input
                          className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                        {formErrors.email && (
                          <span className={styles.errorMessage}>{formErrors.email}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Special Requests (Optional)</label>
                        <Textarea
                          className={styles.textarea}
                          placeholder="Any special requests or dietary requirements?"
                          value={formData.specialRequests}
                          onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <Button type="button" variant="outline" className={styles.backButton} onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!formData.name || !formData.phone || !formData.email}
                      >
                        Complete Reservation
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmationIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.checkIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={styles.confirmationTitle}>Reservation Confirmed</h2>
            <p className={styles.confirmationMessage}>
              Thank you for your reservation. We have sent a confirmation to your email.
            </p>
            <div className={styles.confirmationDetails}>
              <h3 className={styles.detailsTitle}>Reservation Details</h3>
              <div className={styles.detailsContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>
                    {restaurants.find((restaurant) => restaurant._id === formData.location)?.name}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date:</span>
                  <span className={styles.detailValue}>{formData.date ? format(new Date(formData.date), "PPP") : ""}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Time:</span>
                  <span className={styles.detailValue}>{formData.time}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Guests:</span>
                  <span className={styles.detailValue}>{formData.guests}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Selected Tables:</span>
                  <span className={styles.detailValue}>
                    <div className={styles.selectedTablesInfo}>
                      {restaurantTables
                        .filter(table => selectedTables.includes(table._id))
                        .map((table, index, array) => (
                          <span key={table._id}>
                            Table {table.tableNumber} ({table.capacity} seats)
                            {index < array.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      }
                      <div className={styles.totalSeats}>
                        Total: {totalSelectedSeats} seats
                      </div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.confirmationActions}>
              <Button variant="outline" asChild className={styles.homeButton}>
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild className={styles.orderButton}>
                <Link href="/delivery">Order Food</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>GOLDEN CRUST</div>
          <div className={styles.footerDivider}></div>
          <div className={styles.footerCopyright}>© 2023 Golden Crust. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
