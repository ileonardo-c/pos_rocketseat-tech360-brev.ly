export interface UploadFileInput {
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

export interface FileStorage {
  ensurePrivateBucket(bucket: string): Promise<void>;
  uploadFile(input: UploadFileInput): Promise<void>;
  createSignedUrl(input: SignedUrlInput): Promise<string>;
}
