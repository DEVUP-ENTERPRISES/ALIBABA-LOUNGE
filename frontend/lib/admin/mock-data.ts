import { menuImages } from "@/lib/menu-images";
import type {
  AdminEvent,
  AdminFranchiseApp,
  AdminInquiry,
  AdminReservation,
  GalleryImage,
} from "./types";

export const dashboardStats = {
  reservations: 128,
  pendingBookings: 14,
  cateringInquiries: 9,
  franchiseApplications: 6,
  menuItems: 0,
  upcomingEvents: 4,
};

export const mockReservations: AdminReservation[] = [
  {
    id: "res-001",
    guestName: "Ahmed Hassan",
    email: "ahmed@email.com",
    phone: "(214) 555-0192",
    date: "2026-05-24",
    time: "9:00 PM",
    partySize: 6,
    notes: "Birthday — prefer corner booth",
    status: "Pending",
    createdAt: "2026-05-20",
  },
  {
    id: "res-002",
    guestName: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "(469) 555-4410",
    date: "2026-05-22",
    time: "8:30 PM",
    partySize: 4,
    status: "Approved",
    createdAt: "2026-05-19",
  },
  {
    id: "res-003",
    guestName: "James Porter",
    email: "jporter@email.com",
    phone: "(972) 555-8821",
    date: "2026-05-21",
    time: "11:00 PM",
    partySize: 8,
    status: "Rejected",
    createdAt: "2026-05-18",
  },
  {
    id: "res-004",
    guestName: "Fatima Ali",
    email: "fatima.a@email.com",
    phone: "(214) 407-7941",
    date: "2026-05-25",
    time: "7:00 PM",
    partySize: 2,
    notes: "Hookah lounge section",
    status: "Pending",
    createdAt: "2026-05-20",
  },
];

export const mockEvents: AdminEvent[] = [
  {
    id: "evt-001",
    title: "Voice of Sheesh Season 1",
    date: "2026-09-01",
    time: "8:00 PM",
    location: "Sheesh Main Lounge",
    featured: true,
    status: "Published",
    image: menuImages.events,
  },
  {
    id: "evt-002",
    title: "Live DJ Fridays",
    date: "2026-05-23",
    time: "10:00 PM",
    location: "Sheesh Main Lounge",
    featured: false,
    status: "Published",
    image: menuImages.lounge,
  },
  {
    id: "evt-003",
    title: "Desi Night",
    date: "2026-06-07",
    time: "9:00 PM",
    location: "Sheesh Main Lounge",
    featured: false,
    status: "Draft",
    image: menuImages.desi,
  },
];

export const mockCateringInquiries: AdminInquiry[] = [
  {
    id: "cat-001",
    name: "Corporate Gala — Nexa Labs",
    email: "events@nexalabs.com",
    phone: "(214) 555-3300",
    eventDate: "2026-07-15",
    details: "120 guests, full catering + 4 hookah stations",
    status: "New",
    createdAt: "2026-05-19",
  },
  {
    id: "cat-002",
    name: "Wedding Reception",
    email: "amina.wed@email.com",
    phone: "(469) 555-2211",
    eventDate: "2026-08-20",
    details: "Desi menu focus, outdoor venue in Plano",
    status: "In Review",
    createdAt: "2026-05-17",
  },
];

export const mockFranchiseApps: AdminFranchiseApp[] = [
  {
    id: "fr-001",
    name: "Khalid Rahman",
    email: "k.rahman@email.com",
    market: "Houston, TX",
    investment: "$750K — $1M",
    background: "10 years hospitality, 2 restaurant concepts",
    status: "New",
    createdAt: "2026-05-18",
  },
  {
    id: "fr-002",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    market: "Austin, TX",
    investment: "$500K — $750K",
    background: "Franchise operator, F&B portfolio",
    status: "Contacted",
    createdAt: "2026-05-15",
  },
];

export const mockGallery: GalleryImage[] = [
  { id: "g1", url: menuImages.lounge, title: "Main Lounge", category: "Ambiance" },
  { id: "g2", url: menuImages.cuisine, title: "Signature Plates", category: "Food" },
  { id: "g3", url: menuImages.hookahLounge, title: "Hookah Experience", category: "Hookah" },
  { id: "g4", url: menuImages.events, title: "Live Events", category: "Events" },
  { id: "g5", url: menuImages.mocktails, title: "Craft Drinks", category: "Drinks" },
  { id: "g6", url: menuImages.desserts, title: "Dessert Bar", category: "Desserts" },
];

export const activityFeed = [
  { id: "a1", text: "New reservation from Fatima Ali", time: "12m ago", type: "reservation" },
  { id: "a2", text: "Catering inquiry — Corporate Gala", time: "1h ago", type: "catering" },
  { id: "a3", text: "Franchise application — Houston", time: "3h ago", type: "franchise" },
  { id: "a4", text: "Menu item updated — Sheesh Mix", time: "5h ago", type: "menu" },
  { id: "a5", text: "Event published — Live DJ Fridays", time: "1d ago", type: "event" },
];
