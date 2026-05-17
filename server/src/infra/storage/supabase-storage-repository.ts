import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  FileStorageRepository,
  SignedUrlInput,
  UploadObjectInput,
} from "../../application/repositories/file-storage-repository.js";
import { env } from "../../config/env.js";

export class SupabaseStorageRepository implements FileStorageRepository {
  constructor(private readonly client: SupabaseClient = createStorageClient()) {}

  async ensurePrivateBucket(bucket: string): Promise<void> {
    const { data, error } = await this.client.storage.getBucket(bucket);

    if (!error && data) {
      if (data.public) {
        await this.client.storage.updateBucket(bucket, { public: false });
      }
      return;
    }

    if (error && error.message.toLowerCase().includes("not found")) {
      const { error: createError } = await this.client.storage.createBucket(bucket, { public: false });
      if (createError && !createError.message.toLowerCase().includes("already")) {
        throw createError;
      }
      return;
    }

    if (error) {
      throw error;
    }
  }

  async uploadObject(input: UploadObjectInput): Promise<void> {
    const { error } = await this.client.storage.from(input.bucket).upload(input.path, input.body, {
      contentType: input.contentType,
      upsert: false,
    });

    if (error) {
      throw error;
    }
  }

  async createSignedUrl(input: SignedUrlInput): Promise<string> {
    const { data, error } = await this.client.storage
      .from(input.bucket)
      .createSignedUrl(input.path, input.expiresInSeconds);

    if (error) {
      throw error;
    }

    if (!data?.signedUrl) {
      throw new Error("Signed URL was not generated");
    }

    return data.signedUrl;
  }
}

function createStorageClient(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
