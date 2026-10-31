import { ResponseEducationDto, UpdateEducationDto } from "api-client";
import { dateUtils } from "@softsurgery/lib";

export const toUpdateEducationDto = (
  edu: ResponseEducationDto,
): UpdateEducationDto => ({
  title: edu.title ?? "",
  institution: edu.institution ?? "",
  startDate: dateUtils.toDateOrNull(edu.startDate) ?? undefined,
  endDate: dateUtils.toDateOrNull(edu.endDate),
  description: edu.description ?? "",
});
