import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "#app/lib/env";
import type { FileStorage, SignedUrlInput, UploadFileInput } from "#app/lib/storage/file-storage";

export class S3Storage implements FileStorage {
  private readonly objectClient: S3Client;
  private readonly signedUrlClient: S3Client;

  constructor(clients: { objectClient?: S3Client; signedUrlClient?: S3Client } = {}) {
    this.objectClient = clients.objectClient ?? createS3Client(env.AWS_ENDPOINT_URL);
    this.signedUrlClient =
      clients.signedUrlClient ??
      createS3Client(env.AWS_S3_PUBLIC_ENDPOINT_URL ?? env.AWS_ENDPOINT_URL);
  }

  async ensurePrivateBucket(bucket: string): Promise<void> {
    try {
      await this.objectClient.send(new HeadBucketCommand({ Bucket: bucket }));
      return;
    } catch (error) {
      if (!(error instanceof S3ServiceException) || !isMissingBucketError(error)) {
        throw error;
      }
    }

    try {
      await this.objectClient.send(new CreateBucketCommand({ Bucket: bucket }));
    } catch (error) {
      if (error instanceof S3ServiceException && isBucketAlreadyExists(error)) {
        return;
      }
      throw error;
    }
  }

  async uploadFile(input: UploadFileInput): Promise<void> {
    await this.objectClient.send(
      new PutObjectCommand({
        Bucket: input.bucket,
        Key: input.path,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  async createSignedUrl(input: SignedUrlInput): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.path,
    });

    return getSignedUrl(this.signedUrlClient, command, {
      expiresIn: input.expiresInSeconds,
    });
  }
}

function createS3Client(endpoint: string | undefined): S3Client {
  const hasStaticCredentials =
    typeof env.AWS_ACCESS_KEY_ID === "string" &&
    env.AWS_ACCESS_KEY_ID.length > 0 &&
    typeof env.AWS_SECRET_ACCESS_KEY === "string" &&
    env.AWS_SECRET_ACCESS_KEY.length > 0;

  const credentials = hasStaticCredentials
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
      }
    : undefined;

  return new S3Client({
    region: env.AWS_REGION,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials,
  });
}

function isMissingBucketError(error: S3ServiceException): boolean {
  return (
    error.name === "NoSuchBucket" ||
    error.name === "NotFound" ||
    error.$metadata.httpStatusCode === 404
  );
}

function isBucketAlreadyExists(error: S3ServiceException): boolean {
  return (
    error.name === "BucketAlreadyOwnedByYou" ||
    error.name === "BucketAlreadyExists" ||
    error.$metadata.httpStatusCode === 409
  );
}
