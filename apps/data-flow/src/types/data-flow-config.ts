export interface ServiceAccountCredentials {
  type: string;
  project_id?: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

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
  serviceAccountEmail: string;
  projectId?: string;
  credentials?: ServiceAccountCredentials;
};
