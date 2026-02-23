export type TResponse<T> = TError | TSuccess<T>;

export type TError = {
  message: string;
  error: string;
  statusCode: number;
};

export type TSuccess<T> = {
  success: boolean;
  message: string;
  data: T | null;
};
