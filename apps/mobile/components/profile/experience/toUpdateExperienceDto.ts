import { toDateOrNull } from "@/lib/date";
import { ResponseExperienceDto, UpdateExperienceDto } from "@instanct/api-client";

export const toUpdateExperienceDto = (
  exp: ResponseExperienceDto,
): UpdateExperienceDto => ({
  title: exp.title ?? "",
  company: exp.company ?? "",
  location: exp.location ?? "",
  workType: exp.workType,
  locationType: exp.locationType,
  startDate: toDateOrNull(exp.startDate) ?? undefined,
  endDate: toDateOrNull(exp.endDate),
  description: exp.description ?? "",
});
