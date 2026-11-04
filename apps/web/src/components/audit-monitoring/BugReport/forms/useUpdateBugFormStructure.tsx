import {
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  SelectOption,
  TextFieldProps,
  OptionListFieldProps,
  TextareaFieldProps,
} from "@softsurgery/form-builder";
import { Avatar, AvatarFallback, AvatarImage } from "@softsurgery/ui";
import { identifyUser, identifyUserAvatar } from "@softsurgery/lib";
import { BugReportStore } from "@/hooks/stores/useBugReportStore";
import { BugVariant, BugStatus } from "@/types";

interface UseUpdateBugFormStructureProps {
  bugReportStore: BugReportStore;
  userOptions: SelectOption[];
}

export const useUpdateBugFormStructure = ({
  bugReportStore,
  userOptions,
}: UseUpdateBugFormStructureProps) => {
  const titleField: Field<TextFieldProps> = {
    id: "title",
    label: "Title",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "e.g. Map markers not rendering properly",
    description: "Brief summary of the issue.",
    error: bugReportStore.updateDtoErrors?.title?.[0],
    props: {
      value: bugReportStore.updateDto.title || "",
      onChange: (value) => {
        bugReportStore.setNested("updateDto.title", value);
        bugReportStore.setNested("updateDtoErrors.title", []);
      },
    },
  };

  const variantField: Field<SelectFieldProps> = {
    id: "variant",
    label: "Category",
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: "Select category",
    description: "The type or category of this bug report.",
    error: bugReportStore.updateDtoErrors?.variant?.[0],
    props: {
      options: Object.values(BugVariant).map((variant) => ({
        label: variant,
        value: variant,
      })),
      value: bugReportStore.updateDto.variant || BugVariant.UI_ISSUE,
      onValueChange: (value) => {
        bugReportStore.setNested("updateDto.variant", value as BugVariant);
        bugReportStore.setNested("updateDtoErrors.variant", []);
      },
    },
  };

  const statusField: Field<SelectFieldProps> = {
    id: "status",
    label: "Status",
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: "Select status",
    description: "Current lifecycle status of the bug.",
    error: bugReportStore.updateDtoErrors?.status?.[0],
    props: {
      options: Object.values(BugStatus).map((status) => ({
        label: status,
        value: status,
      })),
      value: bugReportStore.updateDto.status || BugStatus.PENDING,
      onValueChange: (value) => {
        bugReportStore.setNested("updateDto.status", value as BugStatus);
        bugReportStore.setNested("updateDtoErrors.status", []);
      },
    },
  };

  const descriptionField: Field<TextareaFieldProps> = {
    id: "description",
    label: "Description",
    variant: FieldVariant.TEXTAREA,
    className: "h-40",
    required: true,
    placeholder:
      "Describe the bug, steps to reproduce, and expected outcome...",
    description: "Detailed description of the bug.",
    error: bugReportStore.updateDtoErrors?.description?.[0],
    props: {
      value: bugReportStore.updateDto.description || "",
      onChange: (value) => {
        bugReportStore.setNested("updateDto.description", value);
        bugReportStore.setNested("updateDtoErrors.description", []);
      },
    },
  };

  const interestedUsersField: Field<OptionListFieldProps> = {
    id: "interestedUsers",
    label: "Interested Users",
    variant: FieldVariant.OPTION_LIST,
    description:
      "Users in this list will receive an email notification once this bug is resolved.",
    error: bugReportStore.updateDtoErrors?.interestedUserIds?.[0],
    props: {
      options: userOptions,
      value: bugReportStore.updateDto.interestedUserIds || [],
      onValueChange: (value) => {
        bugReportStore.setNested("updateDto.interestedUserIds", value);
        bugReportStore.setNested("updateDtoErrors.interestedUserIds", []);
      },
      selectedOnTop: true,
      searchPlaceholder: "Search users by name or email...",
      renderItem: (item) => {
        const user = item.user;
        const name = user ? identifyUser(user) : item.label;
        const email = user?.email;
        const fallback = user
          ? identifyUserAvatar(user)
          : name.slice(0, 2).toUpperCase();
        const profilePicture = user?.picture?.url || user?.image;

        return (
          <div className="flex items-center gap-3 py-1 flex-1 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profilePicture} alt={name} />
              <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left min-w-0 overflow-hidden">
              <span className="text-sm font-medium leading-tight truncate">
                {name}
              </span>
              {email && (
                <span className="text-xs text-muted-foreground truncate">
                  {email}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
  };

  const updateBugFormStructure: FormStructure = {
    title: "",
    description: "",
    fieldsets: [
      {
        title: "Bug Details",
        description: "Edit bug report information and notifications.",
        rows: [
          {
            fields: [titleField, variantField, statusField],
          },
          {
            fields: [descriptionField],
          },
          {
            fields: [interestedUsersField],
          },
        ],
      },
    ],
  };

  return {
    updateBugFormStructure,
  };
};
