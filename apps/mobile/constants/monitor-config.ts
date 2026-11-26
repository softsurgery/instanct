import React from "react";
import { usePreferencePersistStore } from "@softsurgery/hooks";
import { Metric } from "@softsurgery/mobile-monitor";
import type { MonitorConfigValue } from "@softsurgery/contexts";

const MONITOR_CONSTANTS = {
  MAX_USED_MEMO: 1024,
  SHOW_METRICS: [Metric.CPU, Metric.GPU, Metric.MEMORY],
};

export function useBootstrapMonitorConfig(): MonitorConfigValue<Metric> {
  const enabled = usePreferencePersistStore((s) => s.monitorEnabled);
  const setEnabled = usePreferencePersistStore((s) => s.setMonitorEnabled);

  return React.useMemo(
    () => ({
      enabled,
      setEnabled,
      constants: MONITOR_CONSTANTS,
    }),
    [enabled, setEnabled],
  );
}
