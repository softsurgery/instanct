import { DataTableConfig } from "@instanct/datatable-builder";

export interface ResponseTemplateDto {
  id: string;
  name?: string;
  content?: string;
  size: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateTemplateDto {
  name: string;
  content: string;
}

export interface UpdateTemplateDto {
  name?: string;
  content?: string;
}

export type TemplateDataTableConfig = DataTableConfig<ResponseTemplateDto>;

export interface TemplateEditorProps {
  className?: string;
  mode: "create" | "edit";
  templateId?: string;
  initialName?: string;
  initialContent?: string;
  isPending?: boolean;
  onSave: (data: { name: string; content: string }) => void;
  onCancel: () => void;
  title: string;
  description?: string;
}

export interface TemplateVisualizerProps {
  className?: string;
  content: string;
  title?: string;
}

export interface TemplatePaginatedResponse<T = ResponseTemplateDto> {
  data: T[];
  meta: {
    pageCount?: number;
    totalCount?: number;
    page?: number;
    limit?: number;
  };
}

export interface TemplateApiResource {
  findPaginated?: (params: {
    page?: string;
    limit?: string;
    sort?: string;
    search?: string;
  }) => Promise<TemplatePaginatedResponse | any>;
  findById?: (id: string) => Promise<ResponseTemplateDto | any>;
  create?: (dto: CreateTemplateDto) => Promise<ResponseTemplateDto | any>;
  update?: (id: string, dto: UpdateTemplateDto) => Promise<ResponseTemplateDto | any>;
  remove?: (id: string) => Promise<void | any>;
}

export interface TemplatesPortalProps {
  className?: string;
  api: {
    findPaginated: (params: {
      page?: string;
      limit?: string;
      sort?: string;
      search?: string;
    }) => Promise<TemplatePaginatedResponse | any>;
    remove: (id: string) => Promise<any>;
  };
  createRoute?: string;
  editRoutePrefix?: string;
  onCreate?: () => void;
  onEdit?: (template: ResponseTemplateDto) => void;
}

export interface TemplateCreatePortalProps {
  api: {
    create: (dto: CreateTemplateDto) => Promise<any>;
  };
  backRoute?: string;
  onSuccess?: (created: any) => void;
  onCancel?: () => void;
}

export interface TemplateEditPortalProps {
  id: string;
  api: {
    findById: (id: string) => Promise<ResponseTemplateDto | any>;
    update: (id: string, dto: UpdateTemplateDto) => Promise<any>;
  };
  backRoute?: string;
  onSuccess?: (updated: any) => void;
  onCancel?: () => void;
}

