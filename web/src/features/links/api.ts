import { api } from "../../api/client";

export interface LinkItem {
  id: string;
  originalUrl: string;
  slug: string;
  accessCount: number;
  createdAt: string;
}

export interface CreateLinkRequest {
  originalUrl: string;
  slug: string;
}

export async function createLink(payload: CreateLinkRequest): Promise<void> {
  await api.post("/urls", payload);
}

export async function deleteLink(slug: string): Promise<void> {
  await api.delete(`/urls/${slug}`);
}

export async function resolveLink(slug: string): Promise<{ fullUrl: string }> {
  const { data } = await api.get<{ fullUrl: string }>(`/urls/${slug}`);
  return data;
}

export async function listLinks(): Promise<LinkItem[]> {
  const { data } = await api.get<LinkItem[]>("/urls");
  return data;
}

export async function incrementAccess(slug: string): Promise<void> {
  await api.post(`/urls/${slug}/increment`);
}

export async function exportLinksCsv(): Promise<{ reportUrl: string; expiresIn: number }> {
  const { data } = await api.get<{ reportUrl: string; expiresIn: number }>("/urls/report");
  return data;
}
