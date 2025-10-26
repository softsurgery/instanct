import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { data } = useQuery({
    queryKey: ["hello"],
    queryFn: () => api.getHello(),
  })
  return <h1>{data?.message ?? "Loading..."}</h1>;
}
