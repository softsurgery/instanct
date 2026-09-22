import { ResponseContentPageDto } from "@/types";
import axios from "./axios";

const findBySlug = async (
  slug: string,
): Promise<ResponseContentPageDto> => {
  const response = await axios.get(`/content-pages/slug/${slug}`);
  return response.data;
};

export const contentPage = {
  findBySlug,
};
