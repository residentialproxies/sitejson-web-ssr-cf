import type {
  DirectoryItem,
  DirectoryListingData,
  DirectoryListingResult,
} from './types';

type DirectoryPaginationPayload = {
  page?: number;
  page_size?: number;
  total?: number;
};

type DirectoryListingPayload = {
  items?: DirectoryItem[];
  pagination?: DirectoryPaginationPayload;
};

export const DEFAULT_DIRECTORY_PAGE_SIZE = 24;

export const createEmptyDirectoryListingData = (
  page = 1,
  pageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
): DirectoryListingData => ({
  items: [],
  page,
  pageSize,
  total: 0,
  totalPages: 0,
});

export const normalizeDirectoryListingData = (
  payload: DirectoryListingPayload | null | undefined,
  fallbackPage = 1,
  fallbackPageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
): DirectoryListingData => {
  const items = (payload?.items ?? []).filter(
    (item): item is DirectoryItem => Boolean(item?.domain),
  );
  const page = payload?.pagination?.page ?? fallbackPage;
  const pageSize = payload?.pagination?.page_size ?? fallbackPageSize;
  const total = payload?.pagination?.total ?? items.length;

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
};

export const createDirectoryListingResult = (
  payload: DirectoryListingPayload | null | undefined,
  fallbackPage = 1,
  fallbackPageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
): DirectoryListingResult => {
  const data = normalizeDirectoryListingData(payload, fallbackPage, fallbackPageSize);
  return {
    status: data.total > 0 ? 'success' : 'empty',
    data,
  };
};

export const createDirectoryListingErrorResult = (
  status: 'unavailable' | 'timeout',
  message: string,
  page = 1,
  pageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
): DirectoryListingResult => ({
  status,
  data: createEmptyDirectoryListingData(page, pageSize),
  message,
});
