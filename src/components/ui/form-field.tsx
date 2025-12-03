import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";

type BaseFieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type SelectFieldProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode };
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseInputClasses = "w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400";
const errorInputClasses = "border-red-300 focus:border-red-400 focus:ring-red-400";
const labelClasses = "mb-1 block text-[11px] font-semibold text-slate-600";
const errorTextClasses = "mt-1 text-[10px] text-red-600";
const hintTextClasses = "mt-1 text-[10px] text-slate-500";

export const FormInput = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, required, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseInputClasses} ${hasError ? errorInputClasses : ""} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
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
FormInput.displayName = "FormInput";

export const FormSelect = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, required, className = "", id, children, ...props }, ref) => {
    const selectId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={selectId} className={labelClasses}>
            {label}
            {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${baseInputClasses} ${hasError ? errorInputClasses : ""} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
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
FormSelect.displayName = "FormSelect";

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, required, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={textareaId} className={labelClasses}>
            {label}
            {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${baseInputClasses} ${hasError ? errorInputClasses : ""} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
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
FormTextarea.displayName = "FormTextarea";

type FormCheckboxProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const checkboxId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 ${hasError ? "border-red-300" : ""} ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${checkboxId}-error` : hint ? `${checkboxId}-hint` : undefined}
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
FormCheckbox.displayName = "FormCheckbox";

type FormErrorSummaryProps = {
  errors: Record<string, { message?: string } | undefined>;
};

export function FormErrorSummary({ errors }: FormErrorSummaryProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, error]) => error?.message)
    .map(([field, error]) => ({ field, message: error!.message! }));

  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <div className="rounded border border-red-200 bg-red-50 px-3 py-2" role="alert">
      <p className="text-[11px] font-semibold text-red-700">Please fix the following errors:</p>
      <ul className="mt-1 list-inside list-disc text-[11px] text-red-600">
        {errorMessages.map(({ field, message }) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
