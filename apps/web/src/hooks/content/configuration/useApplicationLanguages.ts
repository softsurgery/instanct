import { api } from "@/lib/api";
import { SelectOption } from "@instanct/form-builder";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export function useApplicationLanguages() {
  const { data: config } = useQuery({
    queryKey: ["configuration", "application"],
    queryFn: () => api.admin.configuration.findOneById("application"),
  });

  const languagesParam = config?.params?.find((p) => p.name === "languages");

  const languages: SelectOption[] = React.useMemo(() => {
    if (!languagesParam?.value) return [];
    try {
      const parsed = JSON.parse(languagesParam.value);
      if (Array.isArray(parsed)) {
        return parsed.map((lang) => {
          return {
            label: lang.label,
            value: lang.code,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }, [languagesParam]);

  return { languages };
}
