import type { CreateLinkInput, Link } from "../../domain/link.js";

export interface LinkRepository {
  create(input: CreateLinkInput): Promise<Link>;
  findBySlug(slug: string): Promise<Link | null>;
  deleteBySlug(slug: string): Promise<boolean>;
  listAll(): Promise<Link[]>;
  incrementAccessCount(slug: string): Promise<boolean>;
}
