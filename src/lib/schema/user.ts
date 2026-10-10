import { z } from "zod";

// --- Role Enum ---
export const RoleEnum = z.enum(["ADMIN", "USER"]);
export type Role = z.infer<typeof RoleEnum>;

// --- User Register Schema ---
export const UserRegisterSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleEnum,
});
export type UserRegister = z.infer<typeof UserRegisterSchema>;

// --- User Login Schema ---
export const UserLoginSchema = z.object({
  email: z.string({ message: "Email is required" }),
  password: z.string({ message: "Password is required" }).min(4),
});
export type UserLogin = z.infer<typeof UserLoginSchema>;

// --- User Response Schema ---
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(), // hashed password if included in response
  profilePhoto: z.string().nullable(),
  bio: z.string().nullable(),
  address: z.string().nullable(),
  activeStatus: z.enum(["ACTIVE", "INACTIVE"]),
  role: RoleEnum,
  mobileNumber: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

// --- User List Response Schema ---
export const UserListResponseSchema = z.array(UserResponseSchema);
export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// --- User Login Response Schema ---
export const UserLoginResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: RoleEnum, // keep consistent with RoleEnum
  email: z.string(),
  token: z.string(),
});
export type UserLoginResponse = z.infer<typeof UserLoginResponseSchema>;

// --- Reset Password Schema ---
export const ResetPasswordSchema = z.object({
  email: z.string({ message: "Email is required" }),
  oldpassword: z.string({ message: "Old Password is required" }).min(4),
  newPassword: z.string({ message: "Password is required" }).min(4),
});

