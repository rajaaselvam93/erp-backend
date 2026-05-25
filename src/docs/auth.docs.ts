import { z } from "zod";
import { registry } from "../config/openapi";
import { Schemas } from "../schemas/index";

// ── Reusable response shapes ───────────────────────────────────────────────

const errorBody = z.object({
  status: z.literal("error"),
  message: z.string(),
  errors: z.array(z.string()).optional(),
});

const tokenData = z.object({
  userId: z.number().openapi({ example: 1 }),
  role: z.string().openapi({ example: "ADMIN" }),
  accessToken: z.string().openapi({ example: "eyJhbGci..." }),
  refreshToken: z.string().openapi({ example: "eyJhbGci..." }),
});

// ── POST /api/auth/register ────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.registerSchema } },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("success"),
            message: z.string(),
            data: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              role: z.string(),
              status: z.string(),
            }),
          }),
        },
      },
    },
    400: { description: "Validation error", content: { "application/json": { schema: errorBody } } },
    409: { description: "Email already exists" },
  },
});

// ── POST /api/auth/login ───────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.loginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: z.object({ status: z.literal("success"), data: tokenData }) } },
    },
    400: { description: "Validation error", content: { "application/json": { schema: errorBody } } },
    401: { description: "Invalid credentials" },
  },
});

// ── POST /api/auth/refresh-token ───────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh-token",
  tags: ["Auth"],
  summary: "Refresh access token",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.refreshTokenSchema } },
    },
  },
  responses: {
    200: {
      description: "New access token issued",
      content: {
        "application/json": {
          schema: z.object({ status: z.literal("success"), data: z.object({ accessToken: z.string() }) }),
        },
      },
    },
    401: { description: "Invalid or expired refresh token" },
  },
});

// ── POST /api/auth/change-password ────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/change-password",
  tags: ["Auth"],
  summary: "Change password (requires auth)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.changePasswordSchema } },
    },
  },
  responses: {
    200: { description: "Password changed successfully" },
    400: { description: "Current password is incorrect" },
    401: { description: "Unauthorized" },
  },
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/forgot-password",
  tags: ["Auth"],
  summary: "Request a password reset link",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.forgotPasswordSchema } },
    },
  },
  responses: {
    200: { description: "Reset link sent" },
    404: { description: "User not found" },
  },
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/reset-password",
  tags: ["Auth"],
  summary: "Reset password using token from email",
  security: [],
  request: {
    body: {
      content: { "application/json": { schema: Schemas.resetPasswordSchema } },
    },
  },
  responses: {
    200: { description: "Password reset successfully" },
    400: { description: "Invalid or expired token, or passwords don't match" },
  },
});
