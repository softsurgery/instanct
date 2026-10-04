import { useDialog } from "@instanct/components";
import { ResponseDeviceInfoDto } from "@instanct/api-client";

interface BugDeviceDialogProps {
  device?: ResponseDeviceInfoDto;
  resetDevice?: () => void;
}

export const useBugDeviceDialog = ({
  device,
  resetDevice,
}: BugDeviceDialogProps) => {
  const {
    DialogFragment: BugDeviceDialog,
    openDialog: openBugDeviceDialog,
    closeDialog: closeBugDeviceDialog,
  } = useDialog({
    title: <div className="leading-normal">Device Information</div>,
    description: "Details about the device used when the bug was reported.",
    children: (
      <div className="flex flex-col gap-4">
        {device ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Manufacturer:</span>
              <span>{device.manufacturer || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Model:</span>
              <span>{device.model || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Platform:</span>
              <span>{device.platform || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Version:</span>
              <span>{device.version || "Unknown"}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No device information available.</div>
        )}
      </div>
    ),
    className: "w-[400px]",
    onToggle: resetDevice,
  });

  return {
    BugDeviceDialog,
    openBugDeviceDialog,
    closeBugDeviceDialog,
  };
};
