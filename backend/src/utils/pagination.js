export function getPaginated(req, page, limit, data) {
  if (!Array.isArray(data)) {
    return { paginatedData: null, pagination: {} };
  }

  const dataLength = data.length;
  let startIndex = (page - 1) * limit;
  let endIndex = page * limit;

  if (endIndex > dataLength) {
    endIndex = dataLength;
  }

  if (startIndex >= dataLength && page > 1) {
    page--;
    startIndex = (page - 1) * limit;
    endIndex = page * limit;
    if (endIndex > dataLength) {
      endIndex = dataLength;
    }
  }

  const paginatedData = data.slice(startIndex, endIndex);

  const pagination = {
    total: dataLength,
    count: endIndex - startIndex,
    perPage: limit,
    currentPage: page,
    totalPages: Math.ceil(dataLength / limit),
    links: {
      next: getNextPageURL(req, page, limit, dataLength),
    },
  };

  return { paginatedData, pagination };
}

function getNextPageURL(req, currentPage, limit, totalItems) {
  if ((currentPage * limit) >= totalItems) {
    return '';
  }
  const nextPage = currentPage + 1;
  return `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}?page=${nextPage}&limit=${limit}`;
}

