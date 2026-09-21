import React from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, cn, Progress } from "@qlp/ui";
import type { AvatarFieldProps as AFP } from "../types";

interface AvatarFieldProps extends AFP {
  id?: string;
  className?: string;
  error?: boolean;
}

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export const AvatarField = ({
  id,
  image,
  progress,
  placeholder,
  fallback,
  accept = "image/*",
  disabled,
  className,
  error,
  resolveImageUrl,
  onFileChange,
  onUpload,
}: AvatarFieldProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const [src, setSrc] = React.useState<string | undefined>(placeholder);

  React.useEffect(() => {
    let cancelled = false;

    const revokeObjectUrl = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const resolveSrc = async () => {
      revokeObjectUrl();

      if (!image) {
        if (!cancelled) setSrc(placeholder);
        return;
      }

      if (isFile(image)) {
        const nextSrc = URL.createObjectURL(image);
        objectUrlRef.current = nextSrc;
        if (!cancelled) setSrc(nextSrc);
        return;
      }

      if (typeof image === "string") {
        if (!cancelled) setSrc(image);
        return;
      }

      if (image.url) {
        if (!cancelled) setSrc(image.url);
        return;
      }

      if (resolveImageUrl) {
        const resolved = await resolveImageUrl(image);
        if (resolved?.startsWith("blob:")) {
          objectUrlRef.current = resolved;
        }
        if (!cancelled) setSrc(resolved || placeholder);
        return;
      }

      if (!cancelled) setSrc(placeholder);
    };

    void resolveSrc();

    return () => {
      cancelled = true;
      revokeObjectUrl();
    };
  }, [image, placeholder, resolveImageUrl]);

  const handleSelect = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    onFileChange?.(file);
    if (onUpload) {
      void onUpload(file, () => undefined);
    }
  };

  const showProgress =
    typeof progress === "number" && progress > 0 && progress < 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={handleSelect}
        className={cn(
          "group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          disabled && "cursor-not-allowed opacity-70",
          error && "border-destructive",
          className,
        )}
      >
        <Avatar className="size-full rounded-[inherit]">
          <AvatarImage src={src} alt={fallback} className="object-cover" />
          <AvatarFallback className="size-full text-lg">
            {fallback || "?"}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity",
            !disabled &&
              "group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          <Camera className="size-6" />
        </span>
        {showProgress && (
          <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 px-4 text-white">
            <Progress value={progress} className="h-1.5 w-3/4" />
            <span className="mt-1 text-xs">{progress}%</span>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
};
