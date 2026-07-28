function idOf(doc) {
  return doc._id?.toString?.() ?? doc.id;
}

function formatReservation(doc) {
  return {
    id: idOf(doc),
    guestName: doc.name,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    date: doc.date,
    time: doc.time,
    partySize: doc.guests,
    guests: doc.guests,
    notes: doc.specialRequest,
    specialRequest: doc.specialRequest,
    status: {
      pending: "Pending",
      confirmed: "Approved",
      cancelled: "Rejected",
    }[doc.status] || doc.status,
    rawStatus: doc.status,
    createdAt: doc.createdAt?.toISOString?.().split("T")[0] ?? doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function formatMenuItem(doc) {
  return {
    id: idOf(doc),
    name: doc.title,
    title: doc.title,
    description: doc.description,
    price: doc.price,
    category: doc.category,
    subcategory: doc.subcategory,
    image: doc.image,
    tags: doc.tags || [],
    featured: doc.featured,
    layout: doc.layout,
    isAvailable: doc.isAvailable,
  };
}

function formatEvent(doc) {
  return {
    id: idOf(doc),
    title: doc.title,
    description: doc.description,
    date: doc.date,
    time: doc.time,
    location: doc.location,
    category: doc.category,
    featured: doc.featured,
    status: doc.status,
    image: doc.image,
    bannerImage: doc.bannerImage,
    createdAt: doc.createdAt,
  };
}

function formatGallery(doc) {
  return {
    id: idOf(doc),
    title: doc.title,
    url: doc.url,
    publicId: doc.publicId,
    category: doc.category,
    tags: doc.tags || [],
    isPublished: doc.isPublished,
  };
}

function formatInquiry(doc) {
  return {
    id: idOf(doc),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    eventDate: doc.eventDate,
    guests: doc.guests,
    details: doc.details,
    market: doc.market,
    investment: doc.investment,
    background: doc.background,
    status: doc.status,
    adminNotes: doc.adminNotes,
    createdAt: doc.createdAt?.toISOString?.().split("T")[0] ?? doc.createdAt,
  };
}

module.exports = {
  formatReservation,
  formatMenuItem,
  formatEvent,
  formatGallery,
  formatInquiry,
};
