import { useDialog } from "@softsurgery/components";
import { ResponseUserDeviceDto } from "@softsurgery/api-client";

interface BugDeviceDialogProps {
  device?: ResponseUserDeviceDto;
  resetDevice?: () => void;
}

export const useBugDeviceDialog = ({
  device,
  resetDevice,
}: BugDeviceDialogProps) => {
  const deviceName = device?.deviceName || "Unknown";
  const deviceModel = device?.deviceModel || "Unknown";
  const os = device?.os || "Unknown";

  const {
    DialogFragment: BugDeviceDialog,
    openDialog: openBugDeviceDialog,
    closeDialog: closeBugDeviceDialog,
  } = useDialog({
    title: <div className="leading-normal">Device Information</div>,
    description: "Details about the user device used when the bug was reported.",
    children: (
      <div className="flex flex-col gap-4">
        {device ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Device Name:</span>
              <span>{deviceName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Model:</span>
              <span>{deviceModel}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">OS / Platform:</span>
              <span>{os}</span>
            </div>
            {device.fingerprint && (
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">Fingerprint:</span>
                <span
                  className="font-mono text-xs max-w-[200px] truncate"
                  title={device.fingerprint}
                >
                  {device.fingerprint}
                </span>
              </div>
            )}
            {device.isTrusted !== undefined && (
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">Trusted:</span>
                <span>{device.isTrusted ? "Yes" : "No"}</span>
              </div>
            )}
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
