function buildPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildSort(query, fallback = "-createdAt") {
  return query.sort || fallback;
}

function paginationPayload({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
}

module.exports = {
  buildPagination,
  buildSort,
  paginationPayload,
};
