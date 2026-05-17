export interface UploadObjectInput {
  bucket: string;
  path: string;
  body: Buffer;
  contentType: string;
}

export interface SignedUrlInput {
  bucket: string;
  path: string;
  expiresInSeconds: number;
}

export interface FileStorageRepository {
  ensurePrivateBucket(bucket: string): Promise<void>;
  uploadObject(input: UploadObjectInput): Promise<void>;
  createSignedUrl(input: SignedUrlInput): Promise<string>;
}
