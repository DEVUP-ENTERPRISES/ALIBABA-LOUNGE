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
