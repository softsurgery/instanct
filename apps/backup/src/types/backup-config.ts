export type BackupConfig = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  sslEnabled: boolean;
  backupDir: string;
  retentionDays: number;
  folderId: string;
  serviceAccountFile: string;
};
