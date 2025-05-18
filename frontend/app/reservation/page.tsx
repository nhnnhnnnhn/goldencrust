"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { useGetRestaurantsQuery } from '@/redux/api'
import { useCreateReservationMutation, useGetAvailableTablesMutation } from '@/redux/api/reservationApi'
import { useGetUserProfileQuery } from '@/redux/api/userApi'
import { useToast } from "@/components/ui/use-toast"
import { useAppSelector } from "@/redux/hooks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { TimePickerGrid } from "@/components/ui/time-picker"
import { TablePicker } from "@/components/ui/table-picker"
import type { Table } from '@/redux/api/reservationApi'

import styles from "./styles.module.css"
import { cn } from "@/lib/utils"

// Define restaurant status type
type RestaurantStatus = 'open' | 'closed'

type FormData = {
  location: string;
  date: string;
  time: string;
  tableIds: string[];
  guests: string;
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export default function ReservationPage() {
  const router = useRouter()
  const { user, isLoading: isLoadingAuth } = useAuth()
  const { token } = useAppSelector((state: any) => state.auth)
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const { data: userProfile, isLoading: isLoadingProfile } = useGetUserProfileQuery()
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  const [getAvailableTables] = useGetAvailableTablesMutation()
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [date, setDate] = useState<Date>()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    location: "",
    date: "",
    time: "",
    tableIds: [],
    guests: "",
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  // Add debug logging for token and auth state
  useEffect(() => {
    console.log('[Frontend Page] Auth state:', { 
      hasUser: !!user, 
      hasToken: !!token,
      token: token ? `${token.substring(0, 10)}...` : null 
    });

    // Check localStorage for token if Redux store token is missing
    if (!token && typeof window !== 'undefined') {
      const localToken = localStorage.getItem('token');
      if (!localToken) {
        console.log('[Frontend Page] No token in localStorage either');
        router.push('/login?redirect=/reservation');
      }
    }
  }, [user, token, router]);

  // Function to calculate total capacity of selected tables
  const getTotalCapacity = (tableIds: string[]) => {
    return tableIds.reduce((total, tableId) => {
      const table = availableTables.find(t => t._id === tableId);
      return total + (table?.capacity || 0);
    }, 0);
  };

  // Check if user is logged in and update form with profile data
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push("/login?redirect=/reservation")
    } else if (user && userProfile) {
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: userProfile.phone || ""
      }))
    }
  }, [user, isLoadingAuth, router, userProfile])

  // Add function to fetch available tables
  const fetchAvailableTables = async () => {
    if (!formData.location || !date || !formData.time) {
      console.log('[Fetch Tables] Missing required fields:', {
        location: formData.location,
        date,
        time: formData.time
      });
      return;
    }

    try {
      const requestData = {
        restaurantId: formData.location,
        date: format(date, 'yyyy-MM-dd'),
        time: formData.time
      };

      console.log('[Fetch Tables] Starting request with data:', requestData);

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[Fetch Tables] No token found, redirecting to login');
        router.push('/login?redirect=/reservation');
        return;
      }

      console.log('[Fetch Tables] Token found:', token.substring(0, 15) + '...');

      // Validate date and time format
      const dateTimeString = `${requestData.date}T${requestData.time}`;
      const isValidDateTime = !isNaN(new Date(dateTimeString).getTime());
      
      if (!isValidDateTime) {
        console.error('[Fetch Tables] Invalid date/time format:', dateTimeString);
        toast({
          title: "Invalid Date/Time",
          description: "Please select a valid date and time",
          variant: "destructive",
        });
        return;
      }

      // Clear previous table selection when fetching new tables
      setFormData(prev => ({
        ...prev,
        tableIds: []
      }));

      console.log('[Fetch Tables] Calling getAvailableTables mutation...');
      const response = await getAvailableTables(requestData).unwrap();
      console.log('[Fetch Tables] Raw response:', JSON.stringify(response, null, 2));

      if (!response?.success) {
        console.error('[Fetch Tables] API returned success: false', response);
        throw new Error(response?.message || 'Failed to fetch tables');
      }

      const tables = response.data;
      console.log('[Fetch Tables] Received tables data:', {
        count: tables?.length,
        tables: tables?.map(t => ({
          id: t._id,
          number: t.tableNumber,
          status: t.status,
          capacity: t.capacity
        }))
      });

      if (!Array.isArray(tables)) {
        console.error('[Fetch Tables] Invalid response format - not an array:', tables);
        toast({
          title: "Error",
          description: "Invalid response format from server",
          variant: "destructive",
        });
        setAvailableTables([]);
        return;
      }

      // Validate each table and enhance with additional metadata
      const validTables = tables.filter(table => {
        const isValid = 
          table && 
          typeof table === 'object' &&
          typeof table._id === 'string' &&
          typeof table.tableNumber === 'string' &&
          typeof table.capacity === 'number' &&
          ['available', 'reserved', 'occupied'].includes(table.status || 'available');

        if (!isValid) {
          console.error('[Fetch Tables] Invalid table data:', table);
        }

        return isValid;
      }).map(table => ({
        ...table,
        isSelectable: (table.status || 'available') === 'available',
        statusText: getTableStatusText(table.status || 'available', table.reservationTime || null),
        capacityText: `${table.capacity} ${table.capacity === 1 ? 'person' : 'people'}`
      }));

      if (validTables.length === 0) {
        console.log('[Fetch Tables] No valid tables available');
        
        // Check if it's because no tables exist or all are reserved
        const errorCode = response.error?.code;
        const errorMessage = errorCode === 'NO_TABLES' && response.error?.details?.reason === 'NO_TABLES_EXIST'
          ? "No tables are configured for this restaurant"
          : "No tables are available for the selected time. Please try another time slot.";
        
        toast({
          title: "No Tables Available",
          description: errorMessage,
          variant: "default",
        });
      }

      setAvailableTables(validTables);

    } catch (error: any) {
      console.error('[Fetch Tables] Error:', {
        status: error?.status,
        data: error?.data,
        message: error?.message || error?.data?.message,
        error
      });
      
      let errorMessage = "Could not fetch available tables";
      let shouldRedirect = false;
      
      if (error?.status === 401) {
        errorMessage = "Please log in to continue";
        shouldRedirect = true;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (shouldRedirect) {
        router.push('/login?redirect=/reservation');
      }

      setAvailableTables([]);
    }
  };

  // Helper function to get table status text
  const getTableStatusText = (status: string, reservationTime: string | null) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return reservationTime 
          ? `Reserved until ${format(new Date(reservationTime), 'h:mm a')}`
          : 'Reserved';
      case 'occupied':
        return 'Currently Occupied';
      default:
        return 'Unknown Status';
    }
  };

  // Update useEffect to fetch tables when date/time is selected
  useEffect(() => {
    if (formData.location && date && formData.time) {
      console.log('[Effect] Triggering table fetch:', {
        location: formData.location,
        date: format(date, 'yyyy-MM-dd'),
        time: formData.time,
        hasToken: !!localStorage.getItem('token')
      });
      fetchAvailableTables();
    }
  }, [formData.location, date, formData.time]);

  // Add useEffect for debugging availableTables
  useEffect(() => {
    console.log('[Debug] Current availableTables:', availableTables);
  }, [availableTables]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    if (field === "time") {
      // Validate time format
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value as string)) {
        console.error('[ReservationPage] Invalid time format:', value);
        return;
      }
      
      // If we have a date, validate the combined date-time
      if (date) {
        const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${value}`;
        const dateTime = new Date(dateTimeString);
        if (isNaN(dateTime.getTime())) {
          console.error('[ReservationPage] Invalid date-time combination:', dateTimeString);
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If time or date changes, fetch available tables
    if ((field === "time" || field === "date") && formData.location) {
      console.log('[ReservationPage] Time/date changed, fetching tables...');
      fetchAvailableTables();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to make a reservation",
          variant: "destructive",
        })
        return
      }

      // Final validation before submission
      if (!formData.location || !date || !formData.time || !formData.guests || formData.tableIds.length === 0) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const totalCapacity = getTotalCapacity(formData.tableIds);
      const requiredCapacity = parseInt(formData.guests);
      if (totalCapacity < requiredCapacity) {
        toast({
          title: "Error",
          description: "Selected tables cannot accommodate all guests",
          variant: "destructive",
        })
        return
      }

      // Create reservation
      const result = await createReservation({
        customerName: user.name,
        customerPhone: userProfile?.phone || "",
        reservationDate: format(date!, 'yyyy-MM-dd'),
        reservationTime: formData.time,
        numberOfGuests: parseInt(formData.guests),
        specialRequests: formData.specialRequests,
        restaurantId: formData.location,
        tableIds: formData.tableIds,
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
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ]

  // Add a function to check if a time is valid for selection
  const isTimeDisabled = (time: string) => {
    if (!date) return true;
    
    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      console.error('[ReservationPage] Invalid time format in isTimeDisabled:', time);
      return true;
    }
    
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      
      // If selected date is today, disable past times
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date.getTime() === today.getTime()) {
        return selectedDateTime < now;
      }
      
      return false;
    } catch (error) {
      console.error('[ReservationPage] Error in isTimeDisabled:', error);
      return true;
    }
  };

  // Show loading state while checking authentication or loading data
  if (isLoadingAuth || isLoadingRestaurants || isCreating || isLoadingProfile) {
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
              {/* Progress indicator */}
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

              <form onSubmit={(e) => {
                e.preventDefault(); // Prevent form from submitting automatically
                if (step < 3) {
                  // If not on final step, just move to next step
                  if (step === 2 && getTotalCapacity(formData.tableIds) < parseInt(formData.guests)) {
                    return; // Don't proceed if not enough seats selected
                  }
                  setStep(step + 1);
                } else {
                  // Only submit on final step
                  handleSubmit(e);
                }
              }}>
                {step === 1 && (
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
                                <span className={styles.tableCount}>
                                  {restaurant.tableNumber} tables
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
                              {date ? format(date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={styles.calendarPopover}>
                            <CalendarComponent
                              mode="single"
                              selected={date}
                              onSelect={(date) => {
                                setDate(date);
                                if (date) {
                                  const formattedDate = format(date, 'yyyy-MM-dd');
                                  console.log('Selected date:', formattedDate);
                                  handleInputChange("date", formattedDate);
                                }
                              }}
                              initialFocus
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              className={styles.calendar}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time</label>
                        <TimePickerGrid
                          value={formData.time}
                          onChange={(time) => handleInputChange("time", time)}
                          disabled={!date}
                          minTime="11:00"
                          maxTime="21:00"
                          interval={30}
                          className={styles.timePicker}
                          isTimeDisabled={isTimeDisabled}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of Guests</label>
                      <Select onValueChange={(value) => handleInputChange("guests", value)}>
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
                        type="button"
                        className={styles.continueButton}
                        onClick={() => setStep(2)}
                        disabled={!formData.location || !formData.date || !formData.time || !formData.guests}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.formStep}>
                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Select a Table</h2>
                      <div className={styles.tableSelection}>
                        {availableTables && availableTables.length > 0 ? (
                          <div onClick={(e) => e.preventDefault()}>
                            <TablePicker
                              value={formData.tableIds}
                              onChange={(tableIds) => {
                                console.log('[Table Selection] Selected tables:', tableIds);
                                handleInputChange("tableIds", tableIds);
                              }}
                              availableTables={availableTables}
                              guestCount={parseInt(formData.guests)}
                              className={styles.tablePicker}
                            />
                          </div>
                        ) : (
                          <div className={styles.noTables}>
                            <p>No tables available for the selected time. Please choose a different time or date.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <Button type="button" variant="outline" className={styles.backButton} onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        className={styles.continueButton}
                        onClick={() => setStep(3)}
                        disabled={
                          !formData.tableIds.length || 
                          getTotalCapacity(formData.tableIds) < parseInt(formData.guests)
                        }
                      >
                        {getTotalCapacity(formData.tableIds) < parseInt(formData.guests) 
                          ? `Need ${parseInt(formData.guests) - getTotalCapacity(formData.tableIds)} more seats` 
                          : 'Continue'
                        }
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
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
                          <span className={styles.summaryValue}>{date ? format(date, "PPP") : ""}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Time:</span>
                          <span className={styles.summaryValue}>{formData.time}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Selected Tables:</span>
                          <span className={styles.summaryValue}>
                            {formData.tableIds.map(tableId => {
                              const table = availableTables.find(t => t._id === tableId);
                              return table ? `Table ${table.tableNumber}` : '';
                            }).join(', ')}
                          </span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Guests:</span>
                          <span className={styles.summaryValue}>{formData.guests}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Contact Information</h2>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Full Name</label>
                          <Input
                            className={cn(styles.input, "bg-gray-50")}
                            value={formData.name}
                            readOnly
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Phone Number</label>
                          <Input
                            className={cn(styles.input, "bg-gray-50")}
                            value={formData.phone || userProfile?.phone || ""}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <Input
                          className={cn(styles.input, "bg-gray-50")}
                          type="email"
                          value={formData.email}
                          readOnly
                          disabled
                        />
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
                      <Button type="button" variant="outline" className={styles.backButton} onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!user || !userProfile?.phone}
                      >
                        Complete Reservation
                      </Button>
                    </div>
                  </div>
                )}
              </form>
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
              Thank you for your reservation.
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
                  <span className={styles.detailValue}>{date ? format(date, "PPP") : ""}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Time:</span>
                  <span className={styles.detailValue}>{formData.time}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Selected Tables:</span>
                  <span className={styles.detailValue}>
                    {formData.tableIds.map(tableId => {
                      const table = availableTables.find(t => t._id === tableId);
                      return table ? `Table ${table.tableNumber}` : '';
                    }).join(', ')}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Guests:</span>
                  <span className={styles.detailValue}>{formData.guests}</span>
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
