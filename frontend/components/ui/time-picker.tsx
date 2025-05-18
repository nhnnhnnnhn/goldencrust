import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerGridProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  interval?: number; // in minutes
  className?: string;
  isTimeDisabled?: (time: string) => boolean;
}

const generateTimeSlots = (
  startHour: number = 11,
  endHour: number = 21,
  interval: number = 30
) => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      // Format hour and minute with leading zeros
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      const timeSlot = `${formattedHour}:${formattedMinute}`;
      
      // Add validation to ensure valid time format
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeSlot)) {
        slots.push(timeSlot);
      }
    }
  }
  return slots;
};

export function TimePickerGrid({
  value,
  onChange,
  disabled = false,
  minTime = "11:00",
  maxTime = "21:00",
  interval = 30,
  className,
  isTimeDisabled,
}: TimePickerGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse min and max time
  const [minHour] = minTime.split(":").map(Number);
  const [maxHour] = maxTime.split(":").map(Number);
  
  const timeSlots = useMemo(() => 
    generateTimeSlots(minHour, maxHour, interval),
    [minHour, maxHour, interval]
  );

  const handleTimeSelect = (time: string) => {
    // Validate time format before calling onChange
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      onChange(time);
      setIsOpen(false);
    } else {
      console.error('[TimePickerGrid] Invalid time format:', time);
    }
  };

  const checkTimeDisabled = (time: string) => {
    if (disabled) return true;
    if (isTimeDisabled && isTimeDisabled(time)) return true;
    
    // Additional time format validation
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return true;
    
    const [hour, minute] = time.split(":").map(Number);
    if (hour < minHour || hour > maxHour) return true;
    
    return false;
  };

  const formatDisplayTime = (time: string) => {
    if (!time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return "Select time";
    }
    return time;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {value ? formatDisplayTime(value) : "Chọn giờ"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="grid grid-cols-4 gap-2 p-4">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={value === time ? "default" : "outline"}
              disabled={checkTimeDisabled(time)}
              onClick={() => {
                handleTimeSelect(time);
              }}
              className={cn(
                "h-9 w-full text-sm font-normal",
                value === time && "bg-primary text-primary-foreground",
                checkTimeDisabled(time) && "opacity-50 cursor-not-allowed"
              )}
            >
              {formatDisplayTime(time)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 