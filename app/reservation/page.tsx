"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

import styles from "./styles.module.css"

export default function ReservationPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [date, setDate] = useState<Date>()
  const [step, setStep] = useState(1)
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

  // Check if user is logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/reservation")
    } else if (user) {
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user, isLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const locations = [
    { id: "hcm-d1", name: "Ho Chi Minh - District 1", address: "8 Nguyễn Huệ, District 1" },
    { id: "hcm-d2", name: "Ho Chi Minh - Thao Dien", address: "12 Thảo Điền, District 2" },
    { id: "hcm-d3", name: "Ho Chi Minh - District 3", address: "45 Võ Văn Tần, District 3" },
    { id: "hanoi-1", name: "Hanoi - Tay Ho", address: "28 Xuân Diệu, Tây Hồ" },
    { id: "hanoi-2", name: "Hanoi - Hoan Kiem", address: "15 Hàng Bạc, Hoàn Kiếm" },
    { id: "danang", name: "Da Nang", address: "10 Bạch Đằng, Hải Châu" },
  ]

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

  // Show loading state while checking authentication
  if (isLoading) {
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
                  <span className={styles.stepLabel}>Details</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className={styles.formStep}>
                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Select a Location</h2>
                      <div className={styles.locationGrid}>
                        {locations.map((location) => (
                          <div
                            key={location.id}
                            className={`${styles.locationCard} ${
                              formData.location === location.id ? styles.selectedLocation : ""
                            }`}
                            onClick={() => handleInputChange("location", location.id)}
                          >
                            <div className={styles.locationIcon}>
                              <MapPin />
                            </div>
                            <div className={styles.locationInfo}>
                              <h3>{location.name}</h3>
                              <p>{location.address}</p>
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
                                setDate(date)
                                if (date) {
                                  handleInputChange("date", format(date, "yyyy-MM-dd"))
                                }
                              }}
                              initialFocus
                              disabled={(date) => date < new Date()}
                              className={styles.calendar}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time</label>
                        <Select onValueChange={(value) => handleInputChange("time", value)}>
                          <SelectTrigger className={styles.selectTrigger}>
                            <SelectValue placeholder="Select time">
                              <div className={styles.selectDisplay}>
                                <Clock className={styles.inputIcon} />
                                {formData.time || "Select time"}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className={styles.selectContent}>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time} className={styles.selectItem}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    <div className={styles.reservationSummary}>
                      <h2 className={styles.summaryTitle}>Reservation Details</h2>
                      <div className={styles.summaryContent}>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Location:</span>
                          <span className={styles.summaryValue}>
                            {locations.find((loc) => loc.id === formData.location)?.name}
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
                            className={styles.input}
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Phone Number</label>
                          <Input
                            className={styles.input}
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <Input
                          className={styles.input}
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
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
                      <Button type="button" variant="outline" className={styles.backButton} onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!formData.name || !formData.email || !formData.phone}
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
              Thank you for your reservation. We have sent a confirmation to your email.
            </p>
            <div className={styles.confirmationDetails}>
              <h3 className={styles.detailsTitle}>Reservation Details</h3>
              <div className={styles.detailsContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>
                    {locations.find((loc) => loc.id === formData.location)?.name}
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
          <div className={styles.footerLogo}>PIZZA LIÊM KHIẾT&apos;S</div>
          <div className={styles.footerDivider}></div>
          <div className={styles.footerCopyright}>© 2023 Pizza Liêm Khiết. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
