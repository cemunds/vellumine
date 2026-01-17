import type { z } from "zod";
import type {
  CreateUserProfile,
  UpdateUserProfile,
  UserProfile,
} from "#shared/parsers/user";

export type UserProfile = z.infer<typeof UserProfile>;

export type CreateUserProfile = z.infer<typeof CreateUserProfile>;

export type UpdateUserProfile = z.infer<typeof UpdateUserProfile>;
