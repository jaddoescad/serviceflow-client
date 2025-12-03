"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";
type ModalAlign = "center" | "top";

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

type ModalSectionProps = {
  children: ReactNode;
  className?: string;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

const ALIGN_CLASSES: Record<ModalAlign, string> = {
  center: "items-center",
  top: "items-start",
};

const PADDING_CLASSES: Record<ModalAlign, string> = {
  center: "py-6",
  top: "py-10",
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
    <div className="fixed inset-0 z-50">
      <div
        className={classNames(
          "absolute inset-0 bg-slate-950/60 transition-opacity",
          backdropClassName
        )}
        aria-hidden="true"
      />
      <div
        className={classNames(
          "relative flex h-full w-full justify-center px-4",
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
            "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none",
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
    <div className={classNames("flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4", className)}>
      <div className="space-y-1">
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
          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children, className }: ModalSectionProps) {
  return (
    <div className={classNames("flex-1 overflow-auto px-5 py-4 text-[13px] text-slate-700", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }: ModalSectionProps) {
  return (
    <div className={classNames("flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4", className)}>
      {children}
    </div>
  );
}
