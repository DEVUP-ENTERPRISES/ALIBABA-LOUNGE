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
    // The admin table has always shown these three labels. Keep them so the
    // existing chips carry on working, and expose the real status alongside
    // for the states that have no legacy label.
    status: {
      pending: "Pending",
      confirmed: "Approved",
      cancelled: "Rejected",
    }[doc.status] || doc.status,
    rawStatus: doc.status,

    reference: doc.reference,
    table: doc.table?._id?.toString?.() ?? doc.table?.toString?.() ?? null,
    tableCode: doc.table?.code ?? doc.tableCode ?? "",
    tableSeats: doc.table?.seats ?? null,
    tableSection: doc.table?.section ?? null,
    statusNote: doc.statusNote || "",

    confirmedAt: doc.confirmedAt,
    seatedAt: doc.seatedAt,
    completedAt: doc.completedAt,
    cancelledAt: doc.cancelledAt,
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
