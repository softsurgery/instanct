export interface MapConfig {
  range: {
    min: number;
    max: number;
    unit: string;
  };
  lastUpdate: {
    value: number;
    unit: string;
  };
  reconnection: {
    maxAttempts: number;
    delay: {
      value: number;
      unit: string;
    };
  };
  refresh: {
    value: number;
    unit: string;
  };
}
