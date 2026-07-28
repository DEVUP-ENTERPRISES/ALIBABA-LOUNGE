"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ReservationModal } from "@/components/reservations/ReservationModal";
import { reservationApi } from "@/lib/admin/data-api";
import type { AdminReservation, ReservationStatus } from "@/lib/admin/types";

interface NewReservationPayload {
  guestName: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  notes?: string;
}

interface ReservationContextValue {
  reservations: AdminReservation[];
  loading: boolean;
  error: string | null;
  refreshReservations: () => Promise<void>;
  addReservation: (payload: NewReservationPayload) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

const statusToApi: Record<ReservationStatus, string> = {
  Pending: "pending",
  Approved: "confirmed",
  Rejected: "cancelled",
};

export function ReservationProvider({
  children,
  loadOnMount = false,
}: {
  children: React.ReactNode;
  loadOnMount?: boolean;
}) {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReservations(await reservationApi.list("?limit=100"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reservations.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadOnMount) {
      setLoading(false);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshReservations();
  }, [loadOnMount, refreshReservations]);

  const addReservation = async (payload: NewReservationPayload) => {
    const reservation = await reservationApi.create(payload);
    setReservations((prev) => [reservation, ...prev]);
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    const updated = await reservationApi.update(id, { status: statusToApi[status] });
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? updated : r))
    );
  };

  const value = useMemo(
    () => ({
      reservations,
      loading,
      error,
      refreshReservations,
      addReservation,
      updateReservationStatus,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      isModalOpen,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reservations, loading, error, refreshReservations, isModalOpen]
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={addReservation}
      />
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservations must be used within a ReservationProvider");
  }
  return context;
}
