import type { IncomingMessage, ServerResponse } from "http";
import { pinoHttp } from "pino-http";
import { logger } from "../logger/index.js";

export const requestLogger = pinoHttp({
  logger,
  // Use our custom requestId instead of pino-http's generated id
  genReqId: (req: IncomingMessage) =>
    (req as IncomingMessage & { requestId?: string }).requestId ?? "unknown",
  customLogLevel: (
    _req: IncomingMessage,
    res: ServerResponse,
    error: Error | undefined,
  ) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (
    req: IncomingMessage,
    _res: ServerResponse,
    _error: Error,
  ) => {
    return `${req.method} ${req.url} failed`;
  },
  // Redaction is already handled by the base logger config
  serializers: {
    req: (req: Record<string, unknown>) => ({
      id: req["id"],
      method: req["method"],
      url: req["url"],
    }),
    res: (res: Record<string, unknown>) => ({
      statusCode: res["statusCode"],
    }),
  },
});
