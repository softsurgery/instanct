import { toDateOrNull } from "@/lib/date";
import { ResponseEducationDto, UpdateEducationDto } from "@instanct/api-client";

export const toUpdateEducationDto = (
  edu: ResponseEducationDto,
): UpdateEducationDto => ({
  title: edu.title ?? "",
  institution: edu.institution ?? "",
  startDate: toDateOrNull(edu.startDate) ?? undefined,
  endDate: toDateOrNull(edu.endDate),
  description: edu.description ?? "",
});
