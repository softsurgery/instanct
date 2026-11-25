import { useQuery } from "@tanstack/react-query";
import { useApi } from "../context/ApiContext";

interface useCheckHealthProps {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useCheckHealth = ({
  enabled = true,
  refetchInterval = 30_000,
}: useCheckHealthProps = {}) => {
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
