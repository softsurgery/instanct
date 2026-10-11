import React from "react";
import { DataTable, DataTableConfig } from "@instanct/datatable-builder";
import { cn } from "@instanct/lib";
import { ResponseTemplateDto } from "../../types";
import { useTemplateColumns } from "./useTemplateColumns";

export interface TemplatesTableProps {
  className?: string;
  containerClassName?: string;
  data: ResponseTemplateDto[];
  context: DataTableConfig<ResponseTemplateDto>;
  isPending?: boolean;
}

export const TemplatesTable = ({
  className,
  containerClassName = "overflow-auto",
  data,
  context,
  isPending,
}: TemplatesTableProps) => {
  const columns = useTemplateColumns(context);

  return (
    <DataTable
      className={cn("flex flex-col flex-1 overflow-hidden p-1", className)}
      containerClassName={containerClassName}
      columns={columns}
      data={data}
      context={context}
      isPending={Boolean(isPending)}
    />
  );
};
