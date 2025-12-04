import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";

export type InputSize = "sm" | "md" | "lg";

type BaseFieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  size?: InputSize;
};

type InputProps = BaseFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;
type SelectProps = BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & { children: ReactNode };
type TextareaProps = BaseFieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;

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

const baseInputClasses =
  "w-full min-w-0 max-w-full box-border rounded-md border border-slate-300 text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 min-h-[44px] sm:min-h-0";

const errorInputClasses =
  "border-red-300 focus:border-red-500 focus:ring-red-500";

const labelClasses = "mb-1 block font-medium uppercase tracking-wide text-slate-600";

const errorTextClasses = "mt-1 text-[10px] text-red-600";

const hintTextClasses = "mt-1 text-[10px] text-slate-500";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, size = "md", className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex min-w-0 flex-col">
        {label && (
          <label htmlFor={inputId} className={`${labelClasses} ${labelSizeClasses[size]}`}>
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            baseInputClasses,
            sizeClasses[size],
            hasError ? errorInputClasses : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={errorTextClasses} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className={hintTextClasses}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, required, size = "md", className = "", id, children, ...props },
    ref
  ) => {
    const selectId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex min-w-0 flex-col">
        {label && (
          <label htmlFor={selectId} className={`${labelClasses} ${labelSizeClasses[size]}`}>
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            baseInputClasses,
            sizeClasses[size],
            hasError ? errorInputClasses : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          aria-required={required}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className={errorTextClasses} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className={hintTextClasses}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, size = "md", className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex min-w-0 flex-col">
        {label && (
          <label
            htmlFor={textareaId}
            className={`${labelClasses} ${labelSizeClasses[size]}`}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            baseInputClasses,
            sizeClasses[size],
            hasError ? errorInputClasses : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className={errorTextClasses} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className={hintTextClasses}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type CheckboxProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const checkboxId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={[
              "h-4 w-4 rounded border-slate-300 text-blue-600 transition",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError ? "border-red-300" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${checkboxId}-error` : hint ? `${checkboxId}-hint` : undefined
            }
            {...props}
          />
          {label && <span className="text-[12px] text-slate-700">{label}</span>}
        </label>
        {error && (
          <p id={`${checkboxId}-error`} className={`${errorTextClasses} ml-6`} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${checkboxId}-hint`} className={`${hintTextClasses} ml-6`}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
