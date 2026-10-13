import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";

interface useExperiencesProps {
  id: string;
  enabled?: boolean;
}

export const useExperiences = ({ id, enabled }: useExperiencesProps) => {
  const api = useApi();
  const {
    data: experiences,
    isPending: isExperiencesPending,
    refetch: refetchExperiences,
  } = useQuery({
    queryKey: ["experiences", id],
    queryFn: () => api.experience.findAllByUser(id),
    enabled,
  });

  return { experiences, isExperiencesPending, refetchExperiences };
};
