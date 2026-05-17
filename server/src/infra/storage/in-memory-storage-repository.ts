import type {
  FileStorageRepository,
  SignedUrlInput,
  UploadObjectInput,
} from "../../application/repositories/file-storage-repository.js";

export class InMemoryStorageRepository implements FileStorageRepository {
  private readonly buckets = new Set<string>();
  private readonly files = new Map<string, Buffer>();

  async ensurePrivateBucket(bucket: string): Promise<void> {
    this.buckets.add(bucket);
  }

  async uploadObject(input: UploadObjectInput): Promise<void> {
    if (!this.buckets.has(input.bucket)) {
      throw new Error("Bucket does not exist");
    }
    this.files.set(`${input.bucket}/${input.path}`, input.body);
  }

  async createSignedUrl(input: SignedUrlInput): Promise<string> {
    const key = `${input.bucket}/${input.path}`;
    if (!this.files.has(key)) {
      throw new Error("File not found");
    }

    return `https://signed.example/${input.bucket}/${input.path}?expiresIn=${input.expiresInSeconds}`;
  }

  getFile(path: string): Buffer | undefined {
    return this.files.get(path);
  }
}
