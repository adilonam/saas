export type HttpStatusEntry = {
  code: number;
  name: string;
  description: string;
};

export const HTTP_STATUS_CODES: HttpStatusEntry[] = [
  { code: 100, name: "Continue", description: "Client should continue with the request." },
  { code: 101, name: "Switching Protocols", description: "Server agrees to change protocol (e.g. WebSocket upgrade)." },
  { code: 102, name: "Processing", description: "Request received; still processing (WebDAV)." },
  { code: 103, name: "Early Hints", description: "Hints about resources to preload while the response is prepared." },
  { code: 200, name: "OK", description: "Request succeeded." },
  { code: 201, name: "Created", description: "Resource was created successfully." },
  { code: 202, name: "Accepted", description: "Accepted for processing; processing not complete." },
  { code: 204, name: "No Content", description: "Success with no body to return." },
  { code: 206, name: "Partial Content", description: "Partial resource returned (range requests)." },
  { code: 301, name: "Moved Permanently", description: "Resource has a new permanent URL." },
  { code: 302, name: "Found", description: "Temporary redirect to another URL." },
  { code: 303, name: "See Other", description: "Redirect to a different URI with GET." },
  { code: 304, name: "Not Modified", description: "Cached version is still valid." },
  { code: 307, name: "Temporary Redirect", description: "Temporary redirect; method and body preserved." },
  { code: 308, name: "Permanent Redirect", description: "Permanent redirect; method and body preserved." },
  { code: 400, name: "Bad Request", description: "Server cannot process the request (malformed syntax)." },
  { code: 401, name: "Unauthorized", description: "Authentication is required or failed." },
  { code: 402, name: "Payment Required", description: "Reserved for future payment flows." },
  { code: 403, name: "Forbidden", description: "Authenticated but not allowed to access this resource." },
  { code: 404, name: "Not Found", description: "No resource matches the request URI." },
  { code: 405, name: "Method Not Allowed", description: "HTTP method is not supported for this resource." },
  { code: 406, name: "Not Acceptable", description: "Cannot produce a response matching Accept headers." },
  { code: 408, name: "Request Timeout", description: "Server closed idle connection before request completed." },
  { code: 409, name: "Conflict", description: "Request conflicts with current state of the resource." },
  { code: 410, name: "Gone", description: "Resource existed but is permanently removed." },
  { code: 413, name: "Payload Too Large", description: "Request body exceeds server limits." },
  { code: 414, name: "URI Too Long", description: "Request URI is longer than the server accepts." },
  { code: 415, name: "Unsupported Media Type", description: "Media type of the body is not supported." },
  { code: 418, name: "I'm a teapot", description: "Easter egg from RFC 2324; not used in production APIs." },
  { code: 422, name: "Unprocessable Entity", description: "Semantics invalid (common for validation errors in APIs)." },
  { code: 425, name: "Too Early", description: "Server unwilling to process a replayed early request." },
  { code: 429, name: "Too Many Requests", description: "Rate limit exceeded; retry after a backoff." },
  { code: 500, name: "Internal Server Error", description: "Unexpected error on the server." },
  { code: 501, name: "Not Implemented", description: "Server does not support the functionality." },
  { code: 502, name: "Bad Gateway", description: "Upstream server returned an invalid response." },
  { code: 503, name: "Service Unavailable", description: "Server temporarily cannot handle the request." },
  { code: 504, name: "Gateway Timeout", description: "Upstream server did not respond in time." },
];

export function findHttpStatus(code: number): HttpStatusEntry | undefined {
  return HTTP_STATUS_CODES.find((e) => e.code === code);
}
