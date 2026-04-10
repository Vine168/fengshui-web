export type ApiError = {
  code: string;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};
