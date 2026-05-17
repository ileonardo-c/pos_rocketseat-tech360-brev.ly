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

export const slugPattern = /^[a-zA-Z0-9_-]+$/;
