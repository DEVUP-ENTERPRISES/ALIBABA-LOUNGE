import { API_BASE_URL, parseApiError, resolveApiAssetUrl } from "@/lib/admin/api";
import type {
  AdminEvent,
  AdminFranchiseApp,
  AdminInquiry,
  AdminReservation,
  GalleryImage,
} from "@/lib/admin/types";
import type { MenuItem } from "@/lib/menu/types";

type JsonRecord = Record<string, unknown>;

function normalizeMenuItem(item: MenuItem): MenuItem {
  return { ...item, image: resolveApiAssetUrl(item.image) };
}

function normalizeEvent(event: AdminEvent): AdminEvent {
  return { ...event, image: resolveApiAssetUrl(event.image) };
}

function normalizeGalleryImage(image: GalleryImage): GalleryImage {
  return { ...image, url: resolveApiAssetUrl(image.url) };
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
) {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export const reservationApi = {
  async list(params = "") {
    const data = await request<{ reservations: AdminReservation[] }>(
      `/reservations${params}`
    );
    return data.reservations;
  },
  async create(payload: {
    guestName?: string;
    name?: string;
    email: string;
    phone: string;
    partySize?: number;
    guests?: number;
    date: string;
    time: string;
    notes?: string;
    specialRequest?: string;
  }) {
    const data = await request<{ reservation: AdminReservation }>(
      "/reservations",
      {
        method: "POST",
        body: JSON.stringify({
          name: payload.name ?? payload.guestName,
          email: payload.email,
          phone: payload.phone,
          guests: payload.guests ?? payload.partySize,
          date: payload.date,
          time: payload.time,
          specialRequest: payload.specialRequest ?? payload.notes ?? "",
        }),
      }
    );
    return data.reservation;
  },
  async update(id: string, payload: JsonRecord) {
    const data = await request<{ reservation: AdminReservation }>(
      `/reservations/${id}`,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    return data.reservation;
  },
  async remove(id: string) {
    await request(`/reservations/${id}`, { method: "DELETE" });
  },
};

export const menuApi = {
  async list(params = "") {
    const data = await request<{ items: MenuItem[] }>(`/menu${params}`);
    return data.items.map(normalizeMenuItem);
  },
  async create(payload: FormData | JsonRecord) {
    const data = await request<{ item: MenuItem }>("/menu", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeMenuItem(data.item);
  },
  async update(id: string, payload: FormData | JsonRecord) {
    const data = await request<{ item: MenuItem }>(`/menu/${id}`, {
      method: "PUT",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeMenuItem(data.item);
  },
  async remove(id: string) {
    await request(`/menu/${id}`, { method: "DELETE" });
  },
};

export const eventApi = {
  async list(params = "") {
    const data = await request<{ events: AdminEvent[] }>(`/events${params}`);
    return data.events.map(normalizeEvent);
  },
  async create(payload: FormData | JsonRecord) {
    const data = await request<{ event: AdminEvent }>("/events", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeEvent(data.event);
  },
  async update(id: string, payload: FormData | JsonRecord) {
    const data = await request<{ event: AdminEvent }>(`/events/${id}`, {
      method: "PUT",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeEvent(data.event);
  },
  async remove(id: string) {
    await request(`/events/${id}`, { method: "DELETE" });
  },
};

export const galleryApi = {
  async list(params = "") {
    const data = await request<{ images: GalleryImage[] }>(
      `/gallery${params}`
    );
    return data.images.map(normalizeGalleryImage);
  },
  async create(payload: JsonRecord | FormData) {
    const data = await request<{ image: GalleryImage }>("/gallery", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeGalleryImage(data.image);
  },
  async update(id: string, payload: JsonRecord | FormData) {
    const data = await request<{ image: GalleryImage }>(`/gallery/${id}`, {
      method: "PUT",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return normalizeGalleryImage(data.image);
  },
  async remove(id: string) {
    await request(`/gallery/${id}`, { method: "DELETE" });
  },
};

export const inquiryApi = {
  async createCatering(payload: JsonRecord) {
    const data = await request<{ inquiry: AdminInquiry }>("/inquiries/catering", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.inquiry;
  },
  async listCatering() {
    const data = await request<{ inquiries: AdminInquiry[] }>("/inquiries/catering");
    return data.inquiries;
  },
  async updateCatering(id: string, payload: JsonRecord) {
    const data = await request<{ inquiry: AdminInquiry }>(`/inquiries/catering/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return data.inquiry;
  },
  async createFranchise(payload: JsonRecord) {
    const data = await request<{ application: AdminFranchiseApp }>("/inquiries/franchise", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.application;
  },
  async listFranchise() {
    const data = await request<{ applications: AdminFranchiseApp[] }>("/inquiries/franchise");
    return data.applications;
  },
};

export const userApi = {
  async list(params = "") {
    return request<{ users: unknown[]; total: number }>(`/users${params}`);
  },
};

export const dashboardApi = {
  async get() {
    return request<{
      stats: {
        reservations: number;
        pendingBookings: number;
        confirmedReservations: number;
        cateringInquiries: number;
        franchiseApplications: number;
        menuItems: number;
        upcomingEvents: number;
      };
      recentReservations: AdminReservation[];
      activityFeed: { id: string; text: string; time: string; type: string }[];
    }>("/dashboard");
  },
};
