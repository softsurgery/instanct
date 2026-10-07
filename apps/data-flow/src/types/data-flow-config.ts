export type DataFlowConfig = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  sslEnabled: boolean;
  dataFlowDir: string;
  retentionDays: number;
  folderId: string;
  serviceAccountFile: string;
};
