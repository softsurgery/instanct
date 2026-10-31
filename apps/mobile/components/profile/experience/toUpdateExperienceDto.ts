import { dateUtils } from "@softsurgery/lib";
import { ResponseExperienceDto, UpdateExperienceDto } from "api-client";

export const toUpdateExperienceDto = (
  exp: ResponseExperienceDto,
): UpdateExperienceDto => ({
  title: exp.title ?? "",
  company: exp.company ?? "",
  location: exp.location ?? "",
  workType: exp.workType,
  locationType: exp.locationType,
  startDate: dateUtils.toDateOrNull(exp.startDate) ?? undefined,
  endDate: dateUtils.toDateOrNull(exp.endDate),
  description: exp.description ?? "",
});
