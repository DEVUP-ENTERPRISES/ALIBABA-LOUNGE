"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminStatCard } from "@/components/admin/ui/AdminStatCard";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { dashboardApi } from "@/lib/admin/data-api";
import { ADMIN_BASE } from "@/lib/admin/navigation";
import type { AdminReservation } from "@/lib/admin/types";
import { formatUsDate, formatUsTime } from "@/lib/format";

export default function AdminDashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof dashboardApi.get>> | null>(null);

  useEffect(() => {
    dashboardApi.get().then(setData).catch(() => setData(null));
  }, []);

  const stats = data?.stats ?? {
    reservations: 0,
    pendingBookings: 0,
    menuItems: 0,
    upcomingEvents: 0,
    confirmedReservations: 0,
  };
  const reservations: AdminReservation[] = data?.recentReservations ?? [];
  const activityFeed = data?.activityFeed ?? [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Reservations" value={stats.reservations} change="+12% this week" accent />
        <AdminStatCard label="Pending Bookings" value={stats.pendingBookings} change="Needs review" />
        <AdminStatCard label="Menu Items" value={stats.menuItems} />
        <AdminStatCard label="Upcoming Events" value={stats.upcomingEvents} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm md:p-6 lg:col-span-2">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Booking Overview
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Weekly reservation velocity and engagement
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-blue-900/50 bg-blue-950/30 px-3 py-1 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
              <span className="inline-block size-1.5 rounded-full bg-blue-500 animate-pulse" />
              LIVE REPORTING
            </div>
          </div>

          <div className="relative z-10 mt-8 h-64 w-full">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-x-0 top-0 border-b border-zinc-800/50 text-[10px] text-zinc-500 pt-1">100%</div>
            <div className="absolute inset-x-0 top-[25%] border-b border-zinc-800/50 text-[10px] text-zinc-500 pt-1">75%</div>
            <div className="absolute inset-x-0 top-[50%] border-b border-zinc-800/50 text-[10px] text-zinc-500 pt-1">50%</div>
            <div className="absolute inset-x-0 top-[75%] border-b border-zinc-800/50 text-[10px] text-zinc-500 pt-1">25%</div>
            <div className="absolute inset-x-0 bottom-[24px] border-b border-zinc-800" />
            
            {/* Chart Columns */}
            <div className="absolute inset-0 flex items-end justify-between gap-3 px-4 pb-0 z-10">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="group/bar flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 translate-y-1 group-hover/bar:opacity-100 group-hover/bar:translate-y-0 transition-all duration-300 text-[11px] font-medium text-zinc-100 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded shadow-lg pointer-events-none mb-1">
                    {h}%
                  </div>
                  
                  {/* The bar element */}
                  <div
                    className="w-full max-w-[30px] rounded-t-md bg-blue-500 transition-all duration-300 group-hover/bar:bg-blue-400 group-hover/bar:scale-x-105"
                    style={{ height: `${h * 0.68}%` }}
                  />
                  
                  {/* Day label */}
                  <span className="text-[10px] font-medium tracking-wider text-zinc-500 group-hover/bar:text-zinc-300 transition-colors duration-300">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-zinc-100 relative z-10">
            Activity Feed
          </h2>
          <ul className="mt-6 space-y-4 relative z-10">
            {activityFeed.map((item) => (
              <li
                key={item.id}
                className="group/item border-b border-zinc-800/50 pb-3 last:border-0 flex gap-3 items-start transition-colors duration-300"
              >
                <span className="inline-block mt-1.5 size-2 shrink-0 rounded-full bg-zinc-700 group-hover/item:bg-blue-500 transition-all duration-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-400 group-hover/item:text-zinc-100 transition-colors duration-300">
                    {item.text}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 relative z-10">
            <h2 className="text-lg font-semibold text-zinc-100">
              Recent Reservations
            </h2>
            <Link
              href={`${ADMIN_BASE}/reservations`}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/50 relative z-10">
            {reservations.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-zinc-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {r.guestName}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatUsDate(r.date)} / {formatUsTime(r.time)} / {r.partySize} guests
                  </p>
                </div>
                <StatusChip status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-zinc-100 relative z-10">
            Analytics Snapshot
          </h2>
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Avg Party Size", value: "4.2" },
              { label: "Peak Hour", value: "9 PM" },
              { label: "Approval Rate", value: "87%" },
              { label: "Hookah Orders", value: "34%" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
              >
                <p className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                  {m.label}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-100">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
