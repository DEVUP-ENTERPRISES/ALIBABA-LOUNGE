"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminStatCard } from "@/components/admin/ui/AdminStatCard";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { dashboardApi } from "@/lib/admin/data-api";
import { ADMIN_BASE } from "@/lib/admin/navigation";
import type { AdminReservation } from "@/lib/admin/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof dashboardApi.get>> | null>(null);

  useEffect(() => {
    dashboardApi.get().then(setData).catch(() => setData(null));
  }, []);

  const stats = data?.stats ?? {
    reservations: 0,
    pendingBookings: 0,
    cateringInquiries: 0,
    franchiseApplications: 0,
    menuItems: 0,
    upcomingEvents: 0,
    confirmedReservations: 0,
  };
  const reservations: AdminReservation[] = data?.recentReservations ?? [];
  const activityFeed = data?.activityFeed ?? [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <AdminStatCard label="Reservations" value={stats.reservations} change="+12% this week" accent />
        <AdminStatCard label="Pending Bookings" value={stats.pendingBookings} change="Needs review" />
        <AdminStatCard label="Catering Inquiries" value={stats.cateringInquiries} />
        <AdminStatCard label="Franchise Apps" value={stats.franchiseApplications} />
        <AdminStatCard label="Menu Items" value={stats.menuItems} />
        <AdminStatCard label="Upcoming Events" value={stats.upcomingEvents} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="group/card glass-luxury relative overflow-hidden rounded-2xl bg-[#111114]/72 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] transition-all duration-700 hover:border-[#d4af37]/20 hover:bg-[#151518]/80 md:p-6 lg:col-span-2">
          {/* Inner hairline */}
          <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl transition-colors duration-700 group-hover/card:border-[#d4af37]/10" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                Booking Overview
              </h2>
              <p className="mt-1 font-[family-name:var(--font-body)] text-xs text-white/40">
                Weekly reservation velocity and engagement
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#d4af37]/15 bg-[#d4af37]/[0.055] px-3 py-1 font-[family-name:var(--font-accent)] text-[8px] tracking-widest text-[#d4af37] uppercase">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE REPORTING
            </div>
          </div>

          <div className="relative z-10 mt-8 h-64 w-full">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-x-0 top-0 border-b border-white/[0.03] text-[8px] tracking-wider text-white/20 font-mono pt-1">100%</div>
            <div className="absolute inset-x-0 top-[25%] border-b border-white/[0.03] text-[8px] tracking-wider text-white/20 font-mono pt-1">75%</div>
            <div className="absolute inset-x-0 top-[50%] border-b border-white/[0.03] text-[8px] tracking-wider text-white/20 font-mono pt-1">50%</div>
            <div className="absolute inset-x-0 top-[75%] border-b border-white/[0.03] text-[8px] tracking-wider text-white/20 font-mono pt-1">25%</div>
            <div className="absolute inset-x-0 bottom-[24px] border-b border-white/[0.08]" />
            
            {/* Chart Columns */}
            <div className="absolute inset-0 flex items-end justify-between gap-3 px-4 pb-0 z-10">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="group/bar flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 translate-y-1 group-hover/bar:opacity-100 group-hover/bar:translate-y-0 transition-all duration-300 font-mono text-[9px] text-[#d4af37] bg-[#050505] border border-[#d4af37]/30 px-2 py-0.5 rounded shadow-xl pointer-events-none mb-1">
                    {h}%
                  </div>
                  
                  {/* The bar element */}
                  <div
                    className="w-full max-w-[30px] rounded-t-[4px] bg-gradient-to-t from-[#8b6914]/20 via-[#d4af37]/60 to-[#f4d977] shadow-[0_0_12px_rgba(212,175,55,0.1)] transition-all duration-500 group-hover/bar:scale-x-105 group-hover/bar:shadow-[0_0_24px_rgba(212,175,55,0.3)]"
                    style={{ height: `${h * 0.68}%` }}
                  />
                  
                  {/* Day label */}
                  <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-wider text-white/40 group-hover/bar:text-white transition-colors duration-300">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="group/card glass-luxury relative overflow-hidden rounded-2xl bg-[#111114]/72 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-700 hover:border-[#d4af37]/20 hover:bg-[#151518]/80 md:p-6">
          {/* Inner hairline */}
          <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl transition-colors duration-700 group-hover/card:border-[#d4af37]/10" />

          <h2 className="font-[family-name:var(--font-display)] text-xl text-white relative z-10">
            Activity Feed
          </h2>
          <ul className="mt-6 space-y-4 relative z-10">
            {activityFeed.map((item) => (
              <li
                key={item.id}
                className="group/item border-b border-white/[0.04] pb-3 last:border-0 flex gap-3 items-start transition-colors duration-300"
              >
                <span className="inline-block mt-1.5 size-1.5 shrink-0 rounded-full bg-[#d4af37]/60 group-hover/item:bg-[#d4af37] group-hover/item:scale-110 transition-all duration-300" />
                <div className="flex-1">
                  <p className="font-[family-name:var(--font-body)] text-sm text-white/70 group-hover/item:text-white transition-colors duration-300">
                    {item.text}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-body)] text-[10px] text-white/35">
                    {item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="group/card glass-luxury relative overflow-hidden rounded-2xl bg-[#111114]/72 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-700 hover:border-[#d4af37]/20 hover:bg-[#151518]/80">
          {/* Inner hairline */}
          <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl transition-colors duration-700 group-hover/card:border-[#d4af37]/10" />

          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 relative z-10">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-white">
              Recent Reservations
            </h2>
            <Link
              href={`${ADMIN_BASE}/reservations`}
              className="font-[family-name:var(--font-body)] text-xs text-[#d4af37] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04] relative z-10">
            {reservations.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="group/row flex flex-col gap-3 px-5 py-4 transition-colors duration-300 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="font-[family-name:var(--font-body)] text-sm text-white group-hover/row:text-[#d4af37] transition-colors duration-300">
                    {r.guestName}
                  </p>
                  <p className="text-xs text-white/40">
                    {r.date} / {r.time} / {r.partySize} guests
                  </p>
                </div>
                <StatusChip status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="group/card glass-luxury relative overflow-hidden rounded-2xl bg-[#111114]/72 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-700 hover:border-[#d4af37]/20 hover:bg-[#151518]/80 md:p-6">
          {/* Inner hairline */}
          <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl transition-colors duration-700 group-hover/card:border-[#d4af37]/10" />

          <h2 className="font-[family-name:var(--font-display)] text-lg text-white relative z-10">
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
                className="group/metric rounded-xl border border-white/[0.06] bg-[#0c0c0e]/70 p-4 transition-all duration-500 hover:border-[#d4af37]/25 hover:bg-[#111114] hover:shadow-[0_4px_24px_rgba(212,175,55,0.04)]"
              >
                <p className="text-[10px] tracking-wide text-white/40 uppercase group-hover/metric:text-white/60 transition-colors duration-300">
                  {m.label}
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#d4af37] group-hover/metric:scale-102 origin-left transition-transform duration-300">
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
