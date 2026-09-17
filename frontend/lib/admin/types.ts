export type ReservationStatus = "Pending" | "Approved" | "Rejected";
export type InquiryStatus = "New" | "In Review" | "Contacted" | "Closed";

export interface AdminReservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
  /** The three legacy labels the admin chips are built around. */
  status: ReservationStatus;
  /** The real state, which has more cases than the chips do. */
  rawStatus: ReservationLifecycle;
  reference: string;
  table: string | null;
  tableCode: string;
  tableSeats: number | null;
  tableSection: string | null;
  statusNote: string;
  confirmedAt?: string | null;
  seatedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  featured: boolean;
  status: "Draft" | "Published" | "Archived";
  image: string;
}

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventDate?: string;
  details: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface AdminFranchiseApp {
  id: string;
  name: string;
  email: string;
  market: string;
  investment: string;
  background: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface AdminSetting {
  brandName: string;
  tagline: string;
  description: string;
  phone: string;
  location: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  hoursSunThu: string;
  hoursFriSat: string;
  eventsBanner?: string;
  cateringBanner?: string;
}

export interface AdminReview {
  id: string;
  author: string;
  role: string;
  quote: string;
  stars: number;
  initial: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt?: string;
}

// ── Floor & orders ───────────────────────────────────────────

export type TableSection = "main-dining" | "backyard" | "patio" | "bar";
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface FloorTable {
  id: string;
  code: string;
  section: TableSection;
  seats: number;
  status: TableStatus;
  sortOrder: number;
  isActive: boolean;
  openOrders: number;
}

/** Every state a booking can be in, as the server names them. */
export type ReservationLifecycle =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no-show";

/**
 * What a guest holding only a reference code may see.
 *
 * Narrower than AdminReservation on purpose: the endpoint behind it is public,
 * so it carries a first name and no contact details at all.
 */
export interface ReservationView {
  reference: string;
  firstName: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationLifecycle;
  tableCode: string | null;
  statusNote: string;
  confirmedAt?: string | null;
  seatedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

/** A table offered for a booking, with the reason it is or is not usable. */
export interface TableOption {
  id: string;
  code: string;
  section: string;
  seats: number;
  fits: boolean;
  free: boolean;
  heldBy: { reference: string; time: string; name: string } | null;
}

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "served"
  | "completed"
  | "cancelled";

/**
 * The slice of an order a guest is allowed to see.
 *
 * Deliberately narrower than `Order` — the endpoint behind it is public, so
 * it carries no name, phone or notes. Keep the two apart so nothing personal
 * drifts into it later.
 */
export interface OrderStatusView {
  id: string;
  orderNumber: number;
  tableCode: string;
  status: OrderStatus;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  total: number;
  serverName: string | null;
  placedAt: string;
  acceptedAt?: string | null;
  servedAt?: string | null;
  completedAt?: string | null;
}

export interface OrderItem {
  menuItem: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  table: string;
  tableCode: string;
  tableSection?: TableSection;
  customer?: string | null;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  assignedTo?: string | null;
  assignedName: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  placedAt: string;
  acceptedAt?: string | null;
  servedAt?: string | null;
  completedAt?: string | null;
  /**
   * How this tab is getting on with the Clover terminal. Only present on
   * staff-facing responses — guest endpoints never return it.
   */
  clover?: {
    state: CloverSyncState;
    orderId: string | null;
    lastError: string;
    /** What Clover says about payment — "" until the till reports one. */
    paymentState?: string;
    paidAt?: string | null;
  } | null;
}

/**
 * A tab rung up on the Clover terminal, mirrored here for the floor view.
 * Read-only — the terminal drives these, not us.
 */
export interface TerminalOrder {
  id: string;
  cloverOrderId: string;
  title: string;
  tableCode: string;
  table: string | null;
  /** Clover's own states: "open" is live, "locked" is paid and closed. */
  state: string;
  paymentState: string;
  total: number;
  items: { name: string; price: number; quantity: number; cloverItemId: string | null }[];
  openedAt: string | null;
  lastSeenAt: string;
}

export interface TerminalSyncStatus {
  configured: boolean;
  running: boolean;
  pollMs: number;
  lastRun: string | null;
  lastError: string;
  lastCount: number;
}

/** One service day's trade, counting the website and the till separately. */
export interface TradeDay {
  day: string;
  webCount: number;
  webRevenue: number;
  terminalCount: number;
  terminalRevenue: number;
  totalCount: number;
  totalRevenue: number;
}

export interface TradeAnalytics {
  days: number;
  timezone: string;
  today: TradeDay;
  totals: { webCount: number; terminalCount: number; totalCount: number; totalRevenue: number };
  busiest: TradeDay | null;
  rows: TradeDay[];
}

/** One entry in the money audit trail. */
export interface AuditEntry {
  id: string;
  action:
    | "order.cancelled"
    | "order.auto-cancelled"
    | "order.completed"
    | "reservation.cancelled"
    | "reservation.no-show";
  orderNumber: number | null;
  tableCode: string;
  amount: number;
  itemCount: number;
  reason: string;
  actor: { kind: "staff" | "system" | "guest"; id: string | null; name: string };
  meta: Record<string, unknown>;
  at: string;
}

export interface AuditSummary {
  count: number;
  amount: number;
}

export type CloverSyncState =
  | "pending"
  | "synced"
  | "failed"
  | "skipped"
  | "voided";

export type StaffRole = "super-admin" | "admin" | "manager" | "server";

export interface StaffMember {
  id: string;
  name: string;
  displayName: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}
