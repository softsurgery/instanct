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

  const languages: SelectOption[] | undefined = React.useMemo(() => {
    if (!languagesParam?.value) return undefined;
    try {
      return JSON.parse(languagesParam.value);
    } catch {
      return undefined;
    }
  }, [languagesParam]);

  return { languages };
}
