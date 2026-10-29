import React from "react";
import { useApi } from "@/contexts/ApiContext";
import {
  ApplicationHeader,
  StableSafeAreaView,
  StableScrollView,
  Loader,
  AppHeaderBack,
  BottomButtonWrapper,
  DestructiveActionSheet,
} from "@softsurgery/mobile-components";
import { Button, Icon, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CheckCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { RequestEvent, RequestStatus } from "api-client";
import { toast } from "sonner-native";
import { RequestLocationSection } from "../RequestLocationSection";
import { RequestSkeleton } from "./RequestSkeleton";
import { StatusBadge } from "./RequestStatus";
import { RequestBanner } from "./RequestBanner";

interface RequestProps {
  id: string;
  isIncoming?: boolean;
  hasLocation?: boolean;
  className?: string;
}

interface ActionConfig {
  key: string;
  label: string;
  onPress: () => void;
  variant?:
    "default" | "outline" | "destructive" | "destructive-outline" | "secondary";
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
}

export const Request = ({
  id,
  className,
  isIncoming,
  hasLocation,
}: RequestProps) => {
  const api = useApi();
  const { t, i18n } = useTranslation("activities");
  const queryClient = useQueryClient();

  const cancelSheetRef = React.useRef<ActionSheetRef>(null);
  const [cancelConfig, setCancelConfig] = React.useState<{
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
  } | null>(null);

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () =>
      api.request.findOneById(
        id,
        ["session", "session.user", "receivers"].join(","),
      ),
  });

  const receiver = request?.receivers?.[0];
  const displayUserId = isIncoming ? request?.session?.user?.id : receiver?.id;

  const { isPending: isUpdatingLocation } = useMutation({
    mutationFn: (payload: {
      location: string;
      latitude: number;
      longitude: number;
    }) => api.request.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success(t("activities.request.toasts.locationUpdated"));
    },
    onError: () => {
      toast.error(t("activities.request.toasts.locationError"));
    },
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (event: RequestEvent) =>
      api.request.updateStatus(Number(id), event),
    onSuccess: (_data, event) => {
      cancelSheetRef.current?.hide();
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      toast.success(
        event === RequestEvent.Accept
          ? t("activities.incomming.request.toasts.accepted")
          : t("activities.incomming.request.toasts.rejected"),
      );
    },
    onError: () => {
      toast.error(t("activities.request.toasts.error"));
    },
  });

  const openCancelSheet = React.useCallback(
    (config: {
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
    }) => {
      setCancelConfig(config);
      cancelSheetRef.current?.show();
    },
    [],
  );

  const handleConfirmCancel = React.useCallback(() => {
    updateStatus(RequestEvent.Reject);
  }, [updateStatus]);

  const handleCloseCancel = React.useCallback(() => {
    cancelSheetRef.current?.hide();
  }, []);

  const { user, isUserPending } = useIdentifiedUser({
    id: displayUserId!,
  });
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    className: "h-12 w-12 rounded-full",
    wrapperClassName:
      "h-12 w-12 rounded-full border border-border bg-background shadow-sm",
    size: { width: 48, height: 48 },
  });

  const editable =
    request?.status === RequestStatus.Accepted ||
    request?.status === RequestStatus.Rejected
      ? false
      : true;

  const isPending = isRequestPending || isUserPending;

  const formattedDateTime = React.useMemo(() => {
    const rawTime = request?.time || request?.session?.plannedStart;
    if (!rawTime) return null;
    const date = new Date(rawTime);
    if (isNaN(date.getTime())) return null;

    const locale = i18n.language || "fr";

    let dateStr = "";
    try {
      const weekday = new Intl.DateTimeFormat(locale, {
        weekday: "long",
      }).format(date);
      const dayMonthYear = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
      dateStr = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonthYear}`;
    } catch {
      dateStr = date.toLocaleDateString();
    }

    let timeStr = "";
    try {
      const startTime = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      if (request?.session?.plannedEnd) {
        const endDate = new Date(request.session.plannedEnd);
        if (!isNaN(endDate.getTime())) {
          const endTime = new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(endDate);
          timeStr = `${startTime} - ${endTime}`;
        } else {
          timeStr = startTime;
        }
      } else {
        timeStr = startTime;
      }
    } catch {
      timeStr = "";
    }

    return { dateStr, timeStr };
  }, [
    request?.time,
    request?.session?.plannedStart,
    request?.session?.plannedEnd,
    i18n.language,
  ]);

  const actions = React.useMemo<ActionConfig[]>(() => {
    if (!request || isPending) return [];

    const cancelMeetingAction: ActionConfig = {
      key: "cancelMeeting",
      label: t(
        "activities.request.actions.cancelMeeting",
        "Annuler la réunion",
      ),
      onPress: () =>
        openCancelSheet({
          title: t(
            "activities.request.actionSheet.cancelMeeting.title",
            "Annuler la réunion",
          ),
          message: t(
            "activities.request.actionSheet.cancelMeeting.message",
            "Êtes-vous sûr de vouloir annuler cette réunion ?",
          ),
          confirmLabel: t(
            "activities.request.actionSheet.cancelMeeting.confirm",
            "Oui, annuler",
          ),
          cancelLabel: t(
            "activities.request.actionSheet.cancelMeeting.cancel",
            "Non, garder",
          ),
        }),
      variant: "destructive-outline",
      disabled: isUpdating,
    };

    const cancelRequestAction: ActionConfig = {
      key: "cancelRequest",
      label: t(
        "activities.request.actions.cancelRequest",
        "Annuler la demande",
      ),
      onPress: () =>
        openCancelSheet({
          title: t(
            "activities.outgoing.request.actionSheet.cancel.title",
            "Annuler la demande",
          ),
          message: t(
            "activities.outgoing.request.actionSheet.cancel.message",
            "Êtes-vous sûr de vouloir annuler cette demande de réunion ?",
          ),
          confirmLabel: t(
            "activities.outgoing.request.actionSheet.cancel.confirm",
            "Oui, annuler",
          ),
          cancelLabel: t(
            "activities.outgoing.request.actionSheet.cancel.cancel",
            "Non, garder",
          ),
        }),
      variant: "destructive-outline",
      disabled: isUpdating,
    };

    const acceptAction: ActionConfig = {
      key: "accept",
      label: t("activities.incomming.request.actions.accept"),
      onPress: () => updateStatus(RequestEvent.Accept),
      variant: "default",
      icon: CheckCheck,
      disabled: isUpdating,
    };

    const rejectAction: ActionConfig = {
      key: "reject",
      label: t("activities.incomming.request.actions.reject"),
      onPress: () =>
        openCancelSheet({
          title: t("activities.incomming.request.actionSheet.reject.title"),
          message: t("activities.incomming.request.actionSheet.reject.message"),
          confirmLabel: t(
            "activities.incomming.request.actionSheet.reject.confirm",
          ),
          cancelLabel: t(
            "activities.incomming.request.actionSheet.reject.cancel",
          ),
        }),
      variant: "destructive-outline",
      icon: XCircle,
      disabled: isUpdating,
    };

    const statusActionsMap: Record<RequestStatus, ActionConfig[]> = {
      [RequestStatus.Accepted]: [cancelMeetingAction],
      [RequestStatus.Rejected]: [],
      [RequestStatus.Expired]: [],
      [RequestStatus.Sent]: isIncoming
        ? [acceptAction, rejectAction]
        : [cancelRequestAction],
    };

    const currentStatus = request.status ?? RequestStatus.Sent;
    return statusActionsMap[currentStatus] ?? [];
  }, [
    request,
    isPending,
    isIncoming,
    isUpdating,
    t,
    openCancelSheet,
    updateStatus,
  ]);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("activities.request.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <StableScrollView className="flex-1 bg-background">
        {isPending ? (
          <View className="p-4">
            <RequestSkeleton hasLocation={hasLocation} />
          </View>
        ) : (
          <View className="p-4 flex flex-col gap-4">
            {/* User row */}
            {user && (
              <View className="flex-row items-center justify-between">
                <Pressable
                  className="flex-row items-center gap-3 flex-1 mr-2 active:opacity-70"
                  onPress={() =>
                    router.push({
                      pathname: "/main/profile/inspect-profile",
                      params: { id: user.id },
                    })
                  }
                >
                  <View className="overflow-hidden rounded-full">
                    {profilePictures[0] ? profilePictures[0] : fallback}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold text-foreground"
                      numberOfLines={1}
                    >
                      {identifyUser(user)}
                    </Text>
                    <Text
                      className="text-sm text-muted-foreground mt-0.5"
                      numberOfLines={1}
                    >
                      {user?.email}
                    </Text>
                  </View>
                </Pressable>
                <StatusBadge status={request?.status} />
              </View>
            )}

            {/* Status Banner */}
            <RequestBanner status={request?.status} isIncoming={!editable} />

            {/* Message Speech Bubble */}
            {Boolean(request?.message) && (
              <View className="self-start max-w-xs rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                <Text className="text-sm leading-5 text-secondary-foreground">
                  {request?.message}
                </Text>
              </View>
            )}

            {/* Date & Time row */}
            <View className="flex-row items-center gap-3">
              <Icon as={Calendar} size={20} className="text-muted-foreground" />
              <View className="flex-1">
                {formattedDateTime ? (
                  <>
                    <Text className="text-base font-semibold text-foreground">
                      {formattedDateTime.dateStr}
                    </Text>
                    <Text className="text-sm font-normal text-muted-foreground mt-0.5">
                      {formattedDateTime.timeStr}
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm italic text-muted-foreground">
                    {t("activities.request.placeholders.dateTime")}
                  </Text>
                )}
              </View>
            </View>

            {/* Location Section */}
            <RequestLocationSection
              location={request?.location}
              latitude={request?.latitude}
              longitude={request?.longitude}
              editable={editable}
            />

            {isUpdatingLocation && (
              <View className="flex-row items-center gap-2">
                <Loader size="small" />
                <Text className="text-sm text-muted-foreground">
                  {t("activities.request.location.updating")}
                </Text>
              </View>
            )}
          </View>
        )}
      </StableScrollView>

      {/* Action Buttons at Bottom */}
      {!isPending && actions.length > 0 && (
        <BottomButtonWrapper>
          {actions.map((action) => (
            <Button
              key={action.key}
              size="lg"
              variant={action.variant ?? "default"}
              className="rounded-xl"
              onPress={action.onPress}
              disabled={action.disabled}
            >
              {action.loading ? (
                <Loader size="small" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  {action.icon && <Icon as={action.icon} size={18} />}
                  <Text className="text-md font-bold">{action.label}</Text>
                </View>
              )}
            </Button>
          ))}
        </BottomButtonWrapper>
      )}

      <DestructiveActionSheet
        ref={cancelSheetRef}
        renderTrigger={false}
        title={cancelConfig?.title}
        message={cancelConfig?.message}
        confirmLabel={cancelConfig?.confirmLabel}
        cancelLabel={cancelConfig?.cancelLabel}
        confirmIcon={XCircle}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancel}
        onClose={handleCloseCancel}
        isPending={isUpdating}
      />
    </StableSafeAreaView>
  );
};
