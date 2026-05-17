import { http } from "@/lib/http";

export interface Link {
  id: string;
  originalUrl: string;
  slug: string;
  accessCount: number;
  createdAt: string;
}

export interface CreateLinkInput {
  originalUrl: string;
  slug: string;
}

export interface ResolveLinkOutput {
  fullUrl: string;
}

export interface ExportLinksCsvOutput {
  reportUrl: string;
  expiresIn: number;
}

export const linkRepository = {
  async create(input: CreateLinkInput): Promise<void> {
    await http.post("/urls", input);
  },

  async deleteBySlug(slug: string): Promise<void> {
    await http.delete(`/urls/${slug}`);
  },

  async resolveBySlug(slug: string): Promise<ResolveLinkOutput> {
    const { data } = await http.get<ResolveLinkOutput>(`/urls/${slug}`);
    return data;
  },

  async listAll(): Promise<Link[]> {
    const { data } = await http.get<Link[]>("/urls");
    return data;
  },

  async incrementAccess(slug: string): Promise<void> {
    await http.post(`/urls/${slug}/increment`);
  },

  async exportCsv(): Promise<ExportLinksCsvOutput> {
    const { data } = await http.get<ExportLinksCsvOutput>("/urls/report");
    return data;
  },
};

export type LinkRepository = typeof linkRepository;
