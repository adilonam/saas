export type WebhookStoredEvent = {
  receivedAt: string;
  method: string;
  path: string;
  search: string;
  headers: Record<string, string>;
  bodyPreview: string;
  bodyTruncated: boolean;
};
