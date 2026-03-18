export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface ApiSuccessResponse<T = JSONValue | null> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ApiError {
  status: 'error';
  error: {
    name: string;
    code: number;
    message: string;
    details?: Record<string, unknown>;
  };
}
