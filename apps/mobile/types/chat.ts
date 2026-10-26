import type {
  MessageVariant,
  ResponseMessageDto,
} from "api-client";
import type { UploadFileInput } from "@/lib/upload";

export type MediaKind = "image" | "video";

export type PendingMediaItem = {
  uri: string;
  kind: MediaKind;
};

export type PendingMediaUpload = {
  clientId: string;
  conversationId: number;
  items: PendingMediaItem[];
  variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
  progress: number;
  status: "uploading" | "sending" | "failed";
  createdAt: Date;
  uploadIds?: number[];
  content?: string;
};

export type PendingTextMessage = {
  clientId: string;
  conversationId: number;
  content: string;
  createdAt: Date;
  status: "pending" | "failed";
};

export type PendingFileItem = {
  filename: string;
  mimetype?: string;
  fileSize?: number;
};

export type PendingFileUpload = {
  clientId: string;
  conversationId: number;
  items: PendingFileItem[];
  progress: number;
  status: "uploading" | "sending" | "failed";
  createdAt: Date;
  uploadIds?: number[];
  content?: string;
};

export type MessageFlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto }
  | { type: "media"; message: ResponseMessageDto }
  | { type: "file"; message: ResponseMessageDto }
  | { type: "static"; message: ResponseMessageDto }
  | { type: "pending-media"; key: string; pending: PendingMediaUpload }
  | { type: "pending-file"; key: string; pending: PendingFileUpload }
  | { type: "pending-text"; key: string; pending: PendingTextMessage };

export interface StagedMedia {
  id: string;
  file: UploadFileInput;
  kind: MediaKind;
  uri: string;
  fileSize?: number;
}
