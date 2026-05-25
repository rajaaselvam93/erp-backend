import { z } from "zod";

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Email must be valid")
  .transform((v) => v.toLowerCase());

const passwordField = (label = "Password") =>
  z
    .string()
    .min(6, `${label} must be at least 6 characters`)
    .max(30, `${label} must be at most 30 characters`);

const loginSchema = z.object({
  email: emailField,
  password: passwordField(),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: emailField,
  password: passwordField(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "ACCOUNTANT", "HR"] as const, {
    error: "Invalid role",
  }),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordField("New password"),
});

const forgotPasswordSchema = z.object({
  email: emailField,
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: passwordField("New password"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const idParamSchema = z.object({
  id: z.coerce.number().int("ID must be an integer").positive("ID must be a positive number"),
});

export const Schemas = {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  idParamSchema,
};
