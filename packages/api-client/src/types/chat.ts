import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export enum MessageVariant {
  TEXT = "text",
  STATIC = "static",
  EMOJI = "emoji",
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

export enum StaticMessageEnum {
  FIRST_MESSAGE = "First Message",
  POKE = "Poke",
}

export enum ConversationReportReason {
  SPAM = "Spam",
  HARASSMENT = "Harassment",
  INAPPROPRIATE_CONTENT = "Inappropriate Content",
  SCAM = "Scam or Fraud",
  OTHER = "Other",
}

export interface ResponseMessageLinkDto extends DatabaseEntity {
  id: number;
  messageId: number;
  url: string;
  startOffset: number;
  endOffset: number;
  order: number;
}

export interface ResponseMessageUploadFileDto extends DatabaseEntity {
  id: number;
  slug: string;
  filename: string;
  mimetype: string;
  size: number;
  isTemporary: boolean;
  isPrivate: boolean;
}

export interface ResponseMessageUploadDto extends DatabaseEntity {
  id: number;
  messageId: number;
  uploadId: number;
  upload?: ResponseMessageUploadFileDto;
  order: number;
}

export interface ResponseConversationDto extends DatabaseEntity {
  id: number;
  participants: ResponseConversationUserDto[];
  messages: ResponseMessageDto[];
  lastMessage: ResponseMessageDto;
  variant: MessageVariant;
  static?: StaticMessageEnum;
  locked: boolean;
  unreadCount?: number;
}

export interface ResponseMessageDto extends DatabaseEntity {
  id: number;
  content: string;
  conversationId: number;
  conversation: ResponseConversationDto;
  userId: string;
  user: ResponseUserDto;
  variant?: MessageVariant;
  static?: StaticMessageEnum;
  uploads?: ResponseMessageUploadDto[];
  links?: ResponseMessageLinkDto[];
}

export interface ResponseConversationUserDto extends DatabaseEntity {
  id: number;
  userId: string;
  conversationId: number;
  user: ResponseUserDto;
  lastCheck: Date;
}

export interface CreateConversationDto {
  users: string[];
}

export interface CreateConversationReportDto {
  reason?: ConversationReportReason;
  description: string;
}

export interface GroupedMessages {
  date: string;
  messages: ResponseMessageDto[];
}
