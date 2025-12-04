"use client";

import {
  createPortal,
} from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type HTMLAttributes,
} from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
export type ModalAlign = "center" | "top";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  size?: ModalSize;
  align?: ModalAlign;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  contentClassName?: string;
  backdropClassName?: string;
  dataTestId?: string;
};

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  hideCloseButton?: boolean;
  className?: string;
  titleId?: string;
  children?: ReactNode;
};

type ModalSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-[calc(100vw-2rem)] sm:max-w-sm",
  md: "max-w-[calc(100vw-2rem)] sm:max-w-md",
  lg: "max-w-[calc(100vw-2rem)] sm:max-w-lg",
  xl: "max-w-[calc(100vw-2rem)] sm:max-w-xl",
  "2xl": "max-w-[calc(100vw-2rem)] sm:max-w-2xl",
  "3xl": "max-w-[calc(100vw-2rem)] sm:max-w-3xl",
  "4xl": "max-w-[calc(100vw-2rem)] sm:max-w-4xl",
  full: "max-w-full mx-4",
};

const ALIGN_CLASSES: Record<ModalAlign, string> = {
  center: "items-center",
  top: "items-start",
};

const PADDING_CLASSES: Record<ModalAlign, string> = {
  center: "py-4 sm:py-6",
  top: "pt-4 pb-4 sm:py-10",
};

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
  labelledBy,
  describedBy,
  size = "lg",
  align = "center",
  closeOnOverlay = true,
  closeOnEsc = true,
  className,
  contentClassName,
  backdropClassName,
  dataTestId,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc || !onClose) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeOnEsc, onClose, open]);

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlay || event.target !== event.currentTarget) {
      return;
    }
    onClose?.();
  };

  if (!mounted || !open) {
    return null;
  }

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.lg;
  const alignClass = ALIGN_CLASSES[align] ?? ALIGN_CLASSES.center;
  const paddingClass = PADDING_CLASSES[align] ?? PADDING_CLASSES.center;

  return createPortal(
    <div className="fixed inset-0 z-50 h-[100dvh] supports-[height:100dvh]:h-[100dvh]">
      <div
        className={classNames(
          "absolute inset-0 bg-slate-950/60 transition-opacity",
          backdropClassName
        )}
        aria-hidden="true"
      />
      <div
        className={classNames(
          "relative flex h-full w-full justify-center px-3 sm:px-4 pb-[env(safe-area-inset-bottom)]",
          alignClass,
          paddingClass
        )}
        onClick={handleOverlayClick}
      >
        <div
          ref={contentRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-label={labelledBy ? undefined : ariaLabel ?? "Dialog"}
          data-testid={dataTestId}
          className={classNames(
            "relative flex w-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none",
            "max-h-[82dvh] sm:max-h-[88vh]",
            sizeClass,
            contentClassName,
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  hideCloseButton = false,
  className,
  titleId,
  children,
}: ModalHeaderProps) {
  return (
    <div
      className={classNames(
        "flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 id={titleId} className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        {subtitle ? <p className="text-[12px] text-slate-600">{subtitle}</p> : null}
        {children}
      </div>
      {hideCloseButton ? null : (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export const ModalBody = forwardRef<HTMLDivElement, ModalSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "flex-1 overflow-auto px-5 py-4 text-[13px] text-slate-700",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalBody.displayName = "ModalBody";

export const ModalFooter = forwardRef<HTMLDivElement, ModalSectionProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4",
          className
        )}
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalFooter.displayName = "ModalFooter";

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Confirmation Dialog - common pattern for delete/confirm actions
type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
};

const variantStyles: Record<"danger" | "warning" | "info", { button: string; icon: string }> = {
  danger: {
    button: "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500",
    icon: "text-rose-600",
  },
  warning: {
    button: "bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-500",
    icon: "text-amber-600",
  },
  info: {
    button: "bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-500",
    icon: "text-blue-600",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <Modal open={open} onClose={onClose} size="sm" ariaLabel={title}>
      <div className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={classNames(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              styles.button
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
