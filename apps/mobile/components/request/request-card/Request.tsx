import React from "react";
import { useApi, useIdentifiedUser } from "api-client/hooks";
import {
  AppHeaderBack,
  ApplicationHeader,
  BottomButtonWrapper,
  DestructiveActionSheet,
  Loader,
  SeeMoreText,
  StableSafeAreaView,
  StableScrollView,
} from "@softsurgery/mobile-components";
import { Button, Icon, Text, Textarea } from "@softsurgery/mobile-ui";
import { cn, dateUtils } from "@softsurgery/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CheckCheck,
  Clock,
  MessageSquare,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useRNServerImages } from "@softsurgery/mobile-hooks";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { RequestEvent, RequestStatus } from "api-client";
import { toast } from "sonner-native";
import { RequestLocationSection } from "../RequestLocationSection";
import { useLayoutConfig } from "@softsurgery/contexts";
import { RequestSkeleton } from "./RequestSkeleton";
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
  variant?: "default" | "destructive-outline";
  icon?: LucideIcon;
  disabled?: boolean;
}

interface CancelSheetConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  requiresReason: boolean;
  event: RequestEvent;
}

export const Request = ({
  id,
  className,
  isIncoming,
  hasLocation,
}: RequestProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
  const api = useApi();
  const { t } = useTranslation("activities");
  const queryClient = useQueryClient();

  const cancelSheetRef = React.useRef<ActionSheetRef>(null);
  const [cancelConfig, setCancelConfig] =
    React.useState<CancelSheetConfig | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () =>
      api.request.findOneById(
        id,
        ["session", "session.user", "receivers"].join(","),
      ),
  });

  const displayUserId = isIncoming
    ? request?.session?.user?.id
    : request?.receivers?.[0]?.id;

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ event, reason }: { event: RequestEvent; reason?: string }) =>
      api.request.updateStatus(Number(id), event, reason),
    onSuccess: (_data, { event }) => {
      cancelSheetRef.current?.hide();
      setCancelReason("");
      ["request", "requests", "incoming-requests", "outgoing-requests"].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key] }),
      );
      toast.success(
        event === RequestEvent.Accept
          ? t("activities.incomming.request.toasts.accepted")
          : event === RequestEvent.Cancel
            ? t("activities.request.toasts.cancelled")
            : t("activities.incomming.request.toasts.rejected"),
      );
    },
    onError: () => {
      toast.error(t("activities.request.toasts.error"));
    },
  });

  const openCancelSheet = React.useCallback(
    (prefix: string, event: RequestEvent, requiresReason = true) => {
      setCancelReason("");
      setCancelConfig({
        title: t(`${prefix}.title`),
        message: t(`${prefix}.message`),
        confirmLabel: t(`${prefix}.confirm`),
        cancelLabel: t(`${prefix}.cancel`),
        requiresReason,
        event,
      });
      cancelSheetRef.current?.show();
    },
    [t],
  );

  const closeCancelSheet = React.useCallback(() => {
    setCancelReason("");
    cancelSheetRef.current?.hide();
  }, []);

  const { user, isUserPending } = useIdentifiedUser({ id: displayUserId! });
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useRNServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    className: "h-12 w-12 rounded-full",
    wrapperClassName:
      "h-12 w-12 rounded-full border border-border bg-background shadow-sm",
    imageOptions: { width: 48, height: 48 },
  });

  const isPending = isRequestPending || isUserPending;

  const startDate = dateUtils.toDateOrNull(
    request?.time || request?.session?.plannedStart,
  );
  const endDate = dateUtils.toDateOrNull(request?.session?.plannedEnd);

  const isArchived = React.useMemo(() => {
    if (!request?.session) return false;
    if (request.session.ended) return true;
    return endDate ? endDate.getTime() <= Date.now() : false;
  }, [request?.session, endDate]);

  const actions = React.useMemo<ActionConfig[]>(() => {
    if (!request || isPending || isArchived) return [];

    const cancelAction = (
      key: string,
      labelKey: string,
      sheetPrefix: string,
      event: RequestEvent,
      requiresReason: boolean,
      icon?: LucideIcon,
    ): ActionConfig => ({
      key,
      label: t(labelKey),
      onPress: () => openCancelSheet(sheetPrefix, event, requiresReason),
      variant: "destructive-outline",
      icon,
      disabled: isUpdating,
    });

    const statusActionsMap: Record<RequestStatus, ActionConfig[]> = {
      [RequestStatus.Accepted]: [
        cancelAction(
          "cancelMeeting",
          "activities.request.actions.cancelMeeting",
          "activities.request.actionSheet.cancelMeeting",
          RequestEvent.Cancel,
          true,
        ),
      ],
      [RequestStatus.Cancelled]: [],
      [RequestStatus.Rejected]: [],
      [RequestStatus.Expired]: [],
      [RequestStatus.Sent]: isIncoming
        ? [
            {
              key: "accept",
              label: t("activities.incomming.request.actions.accept"),
              onPress: () => updateStatus({ event: RequestEvent.Accept }),
              variant: "default",
              icon: CheckCheck,
              disabled: isUpdating,
            },
            cancelAction(
              "reject",
              "activities.incomming.request.actions.reject",
              "activities.incomming.request.actionSheet.reject",
              RequestEvent.Reject,
              false,
              XCircle,
            ),
          ]
        : [
            cancelAction(
              "cancelRequest",
              "activities.request.actions.cancelRequest",
              "activities.outgoing.request.actionSheet.cancel",
              RequestEvent.Cancel,
              true,
            ),
          ],
    };

    return statusActionsMap[request.status ?? RequestStatus.Sent] ?? [];
  }, [
    request,
    isPending,
    isArchived,
    isIncoming,
    isUpdating,
    t,
    openCancelSheet,
    updateStatus,
  ]);

  const isCancelDisabled =
    Boolean(cancelConfig?.requiresReason) && !cancelReason.trim();

  return (
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{ wrapper: applicationHeaderClassNames.wrapper }}
        title={t("activities.request.title")}
        titleVariant="large"
        reverse
        shortcuts={[{ key: "back", render: <AppHeaderBack /> }]}
      />

      <StableScrollView className="flex-1 rounded-b-xl">
        {isPending ? (
          <View className="p-4">
            <RequestSkeleton hasLocation={hasLocation} />
          </View>
        ) : (
          <View className="p-4 gap-3.5">
            {user && (
              <Pressable
                className="flex-row items-center justify-between gap-3 active:opacity-75 my-4"
                onPress={() =>
                  router.push({
                    pathname: "/main/profile/inspect-profile",
                    params: { id: user.id },
                  })
                }
              >
                <View className="flex-row items-center gap-3 flex-1 min-w-0">
                  <View className="overflow-hidden rounded-full">
                    {profilePictures[0] ?? fallback}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-base font-bold text-foreground"
                      numberOfLines={1}
                    >
                      {identifyUser(user)}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground mt-0.5"
                      numberOfLines={1}
                    >
                      {user.username ? `@${user.username}` : user.email}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}

            <View className="flex flex-col gap-4 px-1 pb-4">
              <View className="flex-row items-start gap-3">
                <View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center">
                  <Icon as={Calendar} size={17} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("activities.request.labels.dateTime")}
                  </Text>
                  {startDate ? (
                    <>
                      <Text className="text-sm font-semibold text-foreground mt-0.5">
                        {dateUtils.toLongDateString(startDate)}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-1">
                        <Icon
                          as={Clock}
                          size={13}
                          className="text-muted-foreground"
                        />
                        <Text className="text-xs text-muted-foreground">
                          {endDate
                            ? `${dateUtils.toTimeOnly(startDate)} - ${dateUtils.toTimeOnly(endDate)}`
                            : dateUtils.toTimeOnly(startDate)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text className="text-sm italic text-muted-foreground mt-0.5">
                      {t("activities.request.placeholders.dateTime")}
                    </Text>
                  )}
                </View>
              </View>

              {Boolean(request?.message) && (
                <View className="flex-row items-start gap-3">
                  <View className="h-9 w-9 rounded-full bg-secondary items-center justify-center">
                    <Icon
                      as={MessageSquare}
                      size={17}
                      className="text-secondary-foreground"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      {t("activities.request.labels.message")}
                    </Text>
                    <SeeMoreText
                      numberOfLines={4}
                      textClassname="text-sm leading-5 text-foreground"
                    >
                      {request!.message!}
                    </SeeMoreText>
                  </View>
                </View>
              )}

              {(request?.status === RequestStatus.Cancelled ||
                request?.status === RequestStatus.Rejected) &&
                Boolean(request?.cancelReason) && (
                  <View className="flex-row items-start gap-3">
                    <View className="h-9 w-9 rounded-full bg-destructive/10 items-center justify-center">
                      <Icon
                        as={XCircle}
                        size={17}
                        className="text-destructive"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-medium uppercase tracking-wide text-destructive mb-0.5">
                        {t("activities.request.labels.cancelReason")}
                      </Text>
                      <SeeMoreText
                        numberOfLines={4}
                        textClassname="text-sm leading-5 text-foreground"
                      >
                        {request.cancelReason!}
                      </SeeMoreText>
                    </View>
                  </View>
                )}
            </View>

            <RequestLocationSection
              location={request?.location}
              latitude={request?.latitude}
              longitude={request?.longitude}
            />
            <RequestBanner
              status={request?.status}
              isIncoming={Boolean(isIncoming)}
            />
          </View>
        )}
      </StableScrollView>

      {!isPending && actions.length > 0 && (
        <BottomButtonWrapper
          orientation={actions.length > 1 ? "horizontal" : "vertical"}
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              size="sm"
              variant={action.variant ?? "default"}
              className={cn("rounded-xl", actions.length > 1 && "flex-1")}
              onPress={action.onPress}
              disabled={action.disabled}
            >
              {isUpdating && action.key === "accept" ? (
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
        disabled={isCancelDisabled}
        customContentSide="bottom"
        customContent={
          cancelConfig?.requiresReason ? (
            <View className="w-full mt-3 pb-6 px-4">
              <Textarea
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder={t("activities.request.placeholders.cancelReason")}
                numberOfLines={3}
                maxLength={500}
              />
            </View>
          ) : undefined
        }
        onConfirm={() => {
          if (!cancelConfig) return;
          updateStatus({
            event: cancelConfig.event,
            reason: cancelReason.trim() || undefined,
          });
        }}
        onCancel={closeCancelSheet}
        onClose={closeCancelSheet}
        isPending={isUpdating}
      />
    </StableSafeAreaView>
  );
};
