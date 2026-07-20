import pino from "pino";
import { env } from "../../config/env.js";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  ...(isProduction
    ? {
      formatters: {
        level(label) {
          return { level: label };
        },
      },
    }
    : {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
    }),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "req.headers['proxy-authorization']",
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "databaseUrl",
      "connectionString",
    ],
    censor: "[REDACTED]",
  },
});
