import { z } from "zod";
import { LocationTypes } from "../user-management";

const baseExperienceSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "experience.validation.titleTooShort",
    })
    .max(100, {
      message: "experience.validation.titleTooLong",
    }),
  company: z
    .string()
    .min(2, {
      message: "experience.validation.companyTooShort",
    })
    .max(100, {
      message: "experience.validation.companyTooLong",
    }),
  startDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.date({
        message: "experience.validation.startDateRequired",
      }),
    )
    .refine(
      (date) => {
        if (!date) return false;
        return date <= new Date();
      },
      {
        message: "experience.validation.startDateFuture",
      },
    ),
  endDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.union([z.date(), z.null()]),
    )
    .optional(),
  description: z
    .string()
    .max(500, {
      message: "experience.validation.descriptionTooLong",
    })
    .optional(),

  location: z
    .string()
    .min(4, {
      message: "experience.validation.titleTooShort",
    })
    .max(20, {
      message: "experience.validation.titleTooLong",
    })
    .optional(),

  locationType: z.enum(LocationTypes).optional(),
});

const withConditionalLocation = baseExperienceSchema.superRefine(
  (data, ctx) => {
    if (data.locationType !== LocationTypes.REMOTE && !data.location) {
      ctx.addIssue({
        path: ["location"],
        code: z.ZodIssueCode.custom,
        message: "experience.validation.locationRequired",
      });
    }
  },
);

const createExperienceSchema = withConditionalLocation
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "experience.validation.endDateBeforeStart",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate <= new Date();
      }
      return true;
    },
    {
      message: "experience.validation.endDateFuture",
      path: ["endDate"],
    },
  );

const updateExperienceSchema = withConditionalLocation
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "experience.validation.endDateBeforeStart",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate <= new Date();
      }
      return true;
    },
    {
      message: "experience.validation.endDateFuture",
      path: ["endDate"],
    },
  );

export { baseExperienceSchema, createExperienceSchema, updateExperienceSchema };
