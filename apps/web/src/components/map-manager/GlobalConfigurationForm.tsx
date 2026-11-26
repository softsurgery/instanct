import React from "react";
import {
  Field,
  FieldVariant,
  FormBuilder,
  FormStructure,
  SwitchFieldProps,
} from "@softsurgery/form-builder";

interface GlobalConfigurationFormProps {
  positionsVisibleToEveryone: boolean;
  includeConnectedUsers: boolean;
  disabled: boolean;
  onPositionsVisibleChange: (checked: boolean) => void;
  onIncludeConnectedUsersChange: (checked: boolean) => void;
}

export const GlobalConfigurationForm: React.FC<
  GlobalConfigurationFormProps
> = ({
  positionsVisibleToEveryone,
  includeConnectedUsers,
  disabled,
  onPositionsVisibleChange,
  onIncludeConnectedUsersChange,
}) => {
  const structure = React.useMemo<FormStructure>(() => {
    const positionsVisibleField: Field<SwitchFieldProps> = {
      id: "positionsVisibleToEveryone",
      label: "Show positions to everyone",
      variant: FieldVariant.SWITCH,
      description: "Appear in app even without an accepted request.",
      props: {
        checked: positionsVisibleToEveryone,
        disabled,
        onCheckedChange: onPositionsVisibleChange,
      },
    };

    const includeConnectedUsersField: Field<SwitchFieldProps> = {
      id: "includeConnectedUsers",
      label: "Show active session users",
      variant: FieldVariant.SWITCH,
      description:
        "Show users actually having an active session on the map and broadcast everyone on the socket.",
      props: {
        checked: includeConnectedUsers,
        disabled,
        onCheckedChange: onIncludeConnectedUsersChange,
      },
    };

    return {
      title: "",
      description: "",
      includeHeader: false,
      fieldsets: [
        {
          title: "Visibility",
          description: "Control experimental geolocation visibility rules.",
          rows: [
            {
              fields: [positionsVisibleField],
            },
            {
              fields: [includeConnectedUsersField],
            },
          ],
        },
      ],
    };
  }, [
    positionsVisibleToEveryone,
    includeConnectedUsers,
    disabled,
    onPositionsVisibleChange,
    onIncludeConnectedUsersChange,
  ]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <FormBuilder structure={structure} className="w-full" />
    </div>
  );
};
