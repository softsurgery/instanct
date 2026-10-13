import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";

interface useCheckHealthProps {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useCheckHealth = (
  { enabled = true, refetchInterval = 5000 }: useCheckHealthProps = {
    enabled: true,
    refetchInterval: 5000,
  },
) => {
  const api = useApi();
  const { data } = useQuery({
    queryKey: ["checkHealth"],
    queryFn: async () => {
      try {
        const response = await api.http.get("/app/health");
        // console.log("Health check response:", response.data);
        return response.data;
      } catch (error) {
        // console.log("Health check failed:", error);
        return { status: "unhealthy" };
      }
    },
    enabled,
    refetchInterval,
  });

  return data;
};
