import { useCallback, useEffect, useRef, useState } from "react";
import type { ScheduleContext, AppointmentDetailContext } from "../types";

export function useUIState() {
  const [scheduleContext, setScheduleContext] = useState<ScheduleContext | null>(null);
  const [navigatingDealId, setNavigatingDealId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openDealMenuId, setOpenDealMenuId] = useState<string | null>(null);
  const [appointmentDetailContext, setAppointmentDetailContext] = useState<AppointmentDetailContext>(null);

  // Mount tracking
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Clear drag error after timeout
  useEffect(() => {
    if (!dragError) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      return;
    }

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    errorTimeoutRef.current = setTimeout(() => {
      setDragError(null);
      errorTimeoutRef.current = null;
    }, 3500);

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [dragError]);

  // Close deal menu on click away
  useEffect(() => {
    if (!openDealMenuId) {
      return undefined;
    }

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-deal-actions]')) {
        setOpenDealMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [openDealMenuId]);

  const closeAppointmentDetails = useCallback(() => {
    setAppointmentDetailContext(null);
  }, []);

  return {
    scheduleContext,
    setScheduleContext,
    navigatingDealId,
    setNavigatingDealId,
    hasMounted,
    dragError,
    setDragError,
    openDealMenuId,
    setOpenDealMenuId,
    appointmentDetailContext,
    setAppointmentDetailContext,
    closeAppointmentDetails,
  };
}
