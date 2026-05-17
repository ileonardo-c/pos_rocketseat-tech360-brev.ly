export interface Link {
  id: string;
  originalUrl: string;
  slug: string;
  accessCount: number;
  createdAt: Date;
}

export interface CreateLinkInput {
  originalUrl: string;
  slug: string;
}

export interface LinkReportRow {
  originalUrl: string;
  shortUrl: string;
  accessCount: number;
  createdAt: Date;
}

export interface LinkModel {
  create(input: CreateLinkInput): Promise<Link>;
  findBySlug(slug: string): Promise<Link | null>;
  deleteBySlug(slug: string): Promise<boolean>;
  listAll(): Promise<Link[]>;
  incrementAccessCount(slug: string): Promise<boolean>;
  streamAllForReport(): AsyncIterable<LinkReportRow>;
}

export const slugPattern = /^[a-zA-Z0-9_-]+$/;
