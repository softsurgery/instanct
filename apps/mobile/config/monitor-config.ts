import { usePreferencePersistStore } from "@softsurgery/hooks";
import { Metric } from "@softsurgery/mobile-monitor";

const MAX_USED_MEMO = 1024;
const SHOW_METRICS: Metric[] = [Metric.CPU, Metric.GPU, Metric.MEMORY];

export const useMonitorConfig = () => {
  const enabled = usePreferencePersistStore((s) => s.monitorEnabled);
  const setEnabled = usePreferencePersistStore((s) => s.setMonitorEnabled);

  return {
    enabled,
    setEnabled,
    constants: {
      MAX_USED_MEMO,
      SHOW_METRICS,
    },
  };
};
