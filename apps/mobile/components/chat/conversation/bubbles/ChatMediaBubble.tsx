import React from "react";
import { format } from "date-fns";
import { Play } from "lucide-react-native";
import { Dimensions, View } from "react-native";
import { Image } from "expo-image";
import { Icon, Skeleton, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { MessageVariant, ResponseMessageDto } from "@softsurgery/api-client";
import { PendingMediaItem, PendingMediaUpload } from "@/types";
import {
  PhotoPreview,
  VideoPreview,
  VideoThumbnailPreview,
} from "@softsurgery/mobile-components";
import { useServerImages } from "~/hooks/content/useServerImages";
import { MessageTextContent } from "./MessageTextContent";
import { MediaImageGrid } from "./ChatMediaImageGrid";
import { MediaUploadProgress } from "../staging/MediaUploadProgress";
import { ChatMediaSkeleton } from "./ChatMediaSkeleton";

interface ChatMediaBubbleProps {
  className?: string;
  message?: ResponseMessageDto;
  pending?: PendingMediaUpload;
  right?: boolean;
}

/**
 * Bubble component rendering single or grouped media (images/videos) with upload status overlays.
 */
export const ChatMediaBubble = ({
  className,
  message,
  pending,
  right,
}: ChatMediaBubbleProps) => {
  const screenWidth = Dimensions.get("window").width;

  const CHAT_MEDIA_WIDTH = Math.round(screenWidth * 0.75);
  const CHAT_MEDIA_HEIGHT = Math.round(CHAT_MEDIA_WIDTH * 0.75);

  /**
   * Extracts and sorts server upload IDs from message attachment DTOs.
   */
  const getMessageUploadIds = (message?: ResponseMessageDto) =>
    [...(message?.uploads ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((upload) => upload.uploadId ?? upload.upload?.id)
      .filter((id): id is number => typeof id === "number");
  const uploadIds = getMessageUploadIds(message);

  const { uploads } = useServerImages({
    ids: uploadIds,
  });

  const pendingItems: PendingMediaItem[] = pending?.items ?? [];
  const mediaCount = pending ? pendingItems.length : uploadIds.length;

  const isVideo =
    pending?.variant === MessageVariant.VIDEO ||
    message?.variant === MessageVariant.VIDEO;

  const timestamp = pending ? pending.createdAt : new Date(message!.createdAt);
  const isUploading = pending?.status === "uploading";
  const isSending = pending?.status === "sending";
  const uploadFailed = pending?.status === "failed";

  const isSingleImage = !isVideo && mediaCount === 1;
  const isGroupedMedia = mediaCount > 1;

  const mediaFrameStyle = {
    width: CHAT_MEDIA_WIDTH,
    height: isGroupedMedia ? CHAT_MEDIA_WIDTH : CHAT_MEDIA_HEIGHT,
  };

  const singleMediaSource = uploads[0];
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);

  const sourceUri =
    typeof singleMediaSource === "object" &&
    singleMediaSource &&
    "uri" in singleMediaSource
      ? singleMediaSource.uri
      : undefined;

  React.useEffect(() => {
    setIsImageLoaded(false);
  }, [sourceUri]);

  if (!pending && mediaCount === 0) {
    return (
      <ChatMediaSkeleton
        className={className}
        right={right}
        isGrouped={false}
        hasCaption={!!message?.content}
      />
    );
  }

  const mediaContent = pending ? (
    isGroupedMedia ? (
      <MediaImageGrid
        uris={pendingItems.map((item) => item.uri)}
        totalCount={mediaCount}
        isVideo={isVideo}
        isUploading={isUploading}
        uploadFailed={uploadFailed}
        progress={pending.progress}
        frameSize={CHAT_MEDIA_WIDTH}
      />
    ) : (
      <View
        className="relative overflow-hidden rounded-xl bg-muted"
        style={mediaFrameStyle}
      >
        {pendingItems[0]?.kind === "image" ? (
          <Image
            source={{ uri: pendingItems[0].uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            {pendingItems[0]?.uri ? (
              <VideoThumbnailPreview source={{ uri: pendingItems[0].uri }} />
            ) : null}
            <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50 z-10">
              <Icon as={Play} size={14} color="white" fill="white" />
            </View>
          </View>
        )}
        {(isUploading || uploadFailed) && (
          <MediaUploadProgress
            progress={pending.progress}
            failed={uploadFailed}
          />
        )}
      </View>
    )
  ) : isGroupedMedia ? (
    <MediaImageGrid
      sources={uploads}
      totalCount={mediaCount}
      isVideo={isVideo}
      frameSize={CHAT_MEDIA_WIDTH}
    />
  ) : isVideo ? (
    <View
      className="relative overflow-hidden rounded-xl bg-muted"
      style={mediaFrameStyle}
    >
      {singleMediaSource ? (
        <VideoThumbnailPreview source={singleMediaSource} />
      ) : (
        <Skeleton
          className="rounded-xl border border-border"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50">
          <Icon as={Play} size={14} color="white" fill="white" />
        </View>
      </View>
    </View>
  ) : (
    <View
      className="relative overflow-hidden rounded-xl bg-muted"
      style={mediaFrameStyle}
    >
      {(!singleMediaSource || !isImageLoaded) && (
        <Skeleton
          className="absolute inset-0 rounded-xl"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      {singleMediaSource ? (
        <Image
          className="rounded-xl"
          style={{ width: "100%", height: "100%" }}
          source={singleMediaSource as any}
          contentFit="cover"
          cachePolicy="memory-disk"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
        />
      ) : null}
    </View>
  );

  const bubble = (
    <View
      className={cn(
        "mx-3 mt-1.5",
        right ? "self-end" : "self-start",
        className,
      )}
      style={{
        maxWidth: CHAT_MEDIA_WIDTH + 24,
        opacity: isSending ? 0.5 : 1,
      }}
    >
      <View>{mediaContent}</View>

      {!!(message?.content || pending?.content) && (
        <View className="px-3 py-2">
          <MessageTextContent
            content={message?.content ?? pending?.content}
            links={message?.links}
            className={cn(
              "text-[15px] leading-5",
              right ? "text-primary-foreground" : "text-secondary-foreground",
            )}
            linkClassName={cn(
              right ? "text-primary-foreground" : "text-primary",
              "font-medium",
            )}
          />
        </View>
      )}

      <View className="px-1 pt-1">
        <Text
          className={cn(
            "text-xs",
            right
              ? "text-muted-foreground text-right"
              : "text-muted-foreground/80 text-left",
          )}
        >
          {format(timestamp, "hh:mm a")}
        </Text>
      </View>
    </View>
  );

  if (pending || !message) {
    return bubble;
  }

  if (isVideo && singleMediaSource) {
    return (
      <VideoPreview
        className={cn(right ? "ml-auto" : "mr-auto")}
        source={singleMediaSource}
      >
        {bubble}
      </VideoPreview>
    );
  }

  if (isSingleImage && singleMediaSource) {
    return (
      <PhotoPreview
        className={cn(right ? "ml-auto" : "mr-auto")}
        source={singleMediaSource}
      >
        {bubble}
      </PhotoPreview>
    );
  }

  return bubble;
};
