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
  status: ReservationStatus;
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

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "served"
  | "completed"
  | "cancelled";

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
}

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
