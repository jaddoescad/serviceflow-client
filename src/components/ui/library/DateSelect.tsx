import { useMemo, type ChangeEvent } from "react";
import { Select } from "./Input";
import type { InputSize } from "./Input";

type DateSelectProps = {
  /** The selected date in YYYY-MM-DD format */
  value: string;
  /** Callback when the date changes, receives YYYY-MM-DD format */
  onChange: (value: string) => void;
  /** Label for the date select group */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Size variant */
  size?: InputSize;
  /** Error message */
  error?: string;
  /** Minimum year to show (default: current year) */
  minYear?: number;
  /** Maximum year to show (default: current year + 2) */
  maxYear?: number;
  /** Name prefix for the select elements */
  name?: string;
};

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function generateDays(year: number, month: number): { value: string; label: string }[] {
  const daysInMonth = getDaysInMonth(year, month);
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      value: day.toString().padStart(2, "0"),
      label: day.toString(),
    };
  });
}

function generateYears(minYear: number, maxYear: number): { value: string; label: string }[] {
  const years: { value: string; label: string }[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push({
      value: year.toString(),
      label: year.toString(),
    });
  }
  return years;
}

export function DateSelect({
  value,
  onChange,
  label,
  required,
  size = "md",
  error,
  minYear,
  maxYear,
  name = "date",
}: DateSelectProps) {
  // Parse the current value
  const [year, month, day] = useMemo(() => {
    if (!value) return ["", "", ""];
    const parts = value.split("-");
    return [parts[0] || "", parts[1] || "", parts[2] || ""];
  }, [value]);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const min = minYear ?? currentYear;
    const max = maxYear ?? currentYear + 2;
    return generateYears(min, max);
  }, [minYear, maxYear, currentYear]);

  // Generate day options based on selected month/year
  const dayOptions = useMemo(() => {
    const y = parseInt(year, 10) || currentYear;
    const m = parseInt(month, 10) || 1;
    return generateDays(y, m);
  }, [year, month, currentYear]);

  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newMonth = event.target.value;
    const y = year || currentYear.toString();
    const d = day || "01";

    // Adjust day if it exceeds days in the new month
    const daysInNewMonth = getDaysInMonth(parseInt(y, 10), parseInt(newMonth, 10));
    const adjustedDay = parseInt(d, 10) > daysInNewMonth
      ? daysInNewMonth.toString().padStart(2, "0")
      : d;

    onChange(`${y}-${newMonth}-${adjustedDay}`);
  };

  const handleDayChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newDay = event.target.value;
    const y = year || currentYear.toString();
    const m = month || "01";
    onChange(`${y}-${m}-${newDay}`);
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newYear = event.target.value;
    const m = month || "01";
    const d = day || "01";

    // Adjust day if it exceeds days in the month for the new year (e.g., Feb 29)
    const daysInMonth = getDaysInMonth(parseInt(newYear, 10), parseInt(m, 10));
    const adjustedDay = parseInt(d, 10) > daysInMonth
      ? daysInMonth.toString().padStart(2, "0")
      : d;

    onChange(`${newYear}-${m}-${adjustedDay}`);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 block text-[12px] font-medium uppercase tracking-wide text-slate-600 sm:text-[11px]">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Select
          name={`${name}-month`}
          value={month}
          onChange={handleMonthChange}
          size={size}
          aria-label="Month"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Select
          name={`${name}-day`}
          value={day}
          onChange={handleDayChange}
          size={size}
          aria-label="Day"
        >
          <option value="">Day</option>
          {dayOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
        <Select
          name={`${name}-year`}
          value={year}
          onChange={handleYearChange}
          size={size}
          aria-label="Year"
        >
          <option value="">Year</option>
          {yearOptions.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </Select>
      </div>
      {error && (
        <p className="mt-1 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
