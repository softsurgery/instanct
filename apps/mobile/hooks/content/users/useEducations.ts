import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";

interface useEducationsProps {
  id: string;
  enabled?: boolean;
}

export const useEducations = ({ id, enabled }: useEducationsProps) => {
  const api = useApi();
  const {
    data: educations,
    isPending: isEducationsPending,
    refetch: refetchEducations,
  } = useQuery({
    queryKey: ["educations", id],
    queryFn: () => api.education.findAllByUser(id),
    enabled,
  });

  return { educations, isEducationsPending, refetchEducations };
};
