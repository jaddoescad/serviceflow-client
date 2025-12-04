"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import type { InputSize } from "./Input";

type DatePickerProps = {
  /** The selected date in YYYY-MM-DD format */
  value: string;
  /** Callback when the date changes, receives YYYY-MM-DD format */
  onChange: (value: string) => void;
  /** Label for the input */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Size variant */
  size?: InputSize;
  /** Error message */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Name attribute */
  name?: string;
};

const sizeClasses: Record<InputSize, string> = {
  sm: "px-2.5 py-2 text-[13px] sm:px-2 sm:py-1 sm:text-[11px]",
  md: "px-3 py-2.5 text-[14px] sm:px-2.5 sm:py-1.5 sm:text-[12px]",
  lg: "px-3.5 py-3 text-[15px] sm:px-3 sm:py-2 sm:text-[13px]",
};

const labelSizeClasses: Record<InputSize, string> = {
  sm: "text-[11px] sm:text-[10px]",
  md: "text-[12px] sm:text-[11px]",
  lg: "text-[13px] sm:text-[12px]",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DatePicker({
  value,
  onChange,
  label,
  required,
  size = "md",
  error,
  placeholder = "Select date",
  name,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the value to a Date object
  const selectedDate = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;

  const displayValue =
    selectedDate && isValid(selectedDate)
      ? format(selectedDate, "MMMM d, yyyy")
      : "";

  // Update currentMonth when value changes
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setCurrentMonth(selectedDate);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const hasError = Boolean(error);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label
          className={`mb-1 block font-medium uppercase tracking-wide text-slate-600 ${labelSizeClasses[size]}`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <button
        type="button"
        name={name}
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "w-full min-w-0 max-w-full box-border rounded-md border text-left shadow-sm transition",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "min-h-[44px] sm:min-h-0",
          hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300",
          displayValue ? "text-slate-700" : "text-slate-400",
          sizeClasses[size],
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="flex items-center justify-between">
          <span>{displayValue || placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          {/* Header with month/year and navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-900">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-medium text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={[
                    "flex h-10 w-full items-center justify-center rounded-md text-sm transition",
                    isSelected
                      ? "bg-blue-600 font-semibold text-white"
                      : isTodayDate
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
