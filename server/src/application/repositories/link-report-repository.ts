export interface LinkReportRow {
  originalUrl: string;
  shortUrl: string;
  accessCount: number;
  createdAt: Date;
}

export interface LinkReportRepository {
  streamAllForReport(): AsyncIterable<LinkReportRow>;
}
