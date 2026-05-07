import { api } from "./api";

export const fetcher = <T>(path: string) => api.get<T>(path);
