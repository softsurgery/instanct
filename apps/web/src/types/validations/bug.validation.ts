import { z } from "zod";
import { BugVariant, BugStatus } from "@/types";

export const createBugSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters long",
    })
    .max(255, {
      message: "Title must not exceed 255 characters",
    }),
  variant: z.nativeEnum(BugVariant, {
    message: "Please select a valid bug variant",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters long",
    })
    .max(1024, {
      message: "Description must not exceed 1024 characters",
    }),
  interestedUserIds: z.array(z.string()).optional(),
  deviceId: z.string().nullable().optional(),
});

export const updateBugSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters long",
    })
    .max(255, {
      message: "Title must not exceed 255 characters",
    }),
  variant: z.nativeEnum(BugVariant, {
    message: "Please select a valid bug variant",
  }),
  status: z
    .nativeEnum(BugStatus, {
      message: "Please select a valid bug status",
    })
    .optional(),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters long",
    })
    .max(1024, {
      message: "Description must not exceed 1024 characters",
    }),
  interestedUserIds: z.array(z.string()).optional(),
  deviceId: z.string().nullable().optional(),
});
