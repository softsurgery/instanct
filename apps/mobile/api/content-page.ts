import { ResponseContentPageDto } from "@/types";
import axios from "./axios";

const findBySlug = async (
  slug: string,
  locale?: string,
): Promise<ResponseContentPageDto> => {
  const response = await axios.get(`/content-pages/slug/${slug}`, {
    params: locale ? { locale } : undefined,
  });
  return response.data;
};

export const contentPage = {
  findBySlug,
};
