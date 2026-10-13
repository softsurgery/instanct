import {
  DataTableCell,
  DataTableColumnHeader,
  DataTableCellVariant,
  DataTableConfig,
} from "@instanct/datatable-builder";

import { JsonToggler, Trans } from "@instanct/components";
import { ResponseLogDto } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { identifyUser } from "@instanct/lib";

const renderLink = (href?: string | null) => {
  if (!href) return <span className="font-medium" />;
  return (
    <Link
      href={href}
      className="hover:underline font-medium text-primary transition-colors"
    />
  );
};

const UNNECESSARY_KEYS = new Set([
  "device",
  "deviceId",
  "ip",
  "fingerprint",
  "receiverSessionIds",
  "plannedStart",
  "plannedEnd",
  "fid",
]);

export const useLoggerColumns = (
  context: DataTableConfig<ResponseLogDto>
): ColumnDef<ResponseLogDto>[] => {
  const { t } = useTranslation("logs");
  return [
    {
      accessorKey: `${t("logger.columns.event")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("logger.columns.event")}
          attribute="event"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const event = row?.original?.event;
        return <Trans ns="logs" i18nKey={`titles.${event}`} />;
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: `${t("logger.columns.description")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("logger.columns.description")}
          attribute="event"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const event = row?.original?.event;
        const logInfo = (row?.original?.logInfo || {}) as Record<string, any>;

        const targetUserId =
          logInfo.targetUserId ||
          logInfo.followedId ||
          logInfo.targetId ||
          logInfo.senderId ||
          logInfo.userId ||
          logInfo.id;

        const authorId =
          logInfo.followerId ||
          logInfo.authorId ||
          row?.original?.user?.id ||
          row?.original?.userId;

        const authorName =
          logInfo.followerName ||
          logInfo.authorName ||
          (row?.original?.user ? identifyUser(row.original.user) : undefined) ||
          row?.original?.user?.username ||
          row?.original?.user?.firstName ||
          "System";

        const targetName =
          logInfo.targetName ||
          logInfo.followedName ||
          logInfo.fullname ||
          logInfo.firstName ||
          logInfo.username ||
          logInfo.bookmarkIdentity ||
          logInfo.senderName ||
          logInfo.clientName ||
          "User";

        const currentUserId =
          row?.original?.user?.id || logInfo.userId || targetUserId;

        const roleId = logInfo.roleId || logInfo.id;
        const pageId = logInfo.pageId || logInfo.contentPageId || logInfo.id;
        const refTypeId = logInfo.refTypeId || logInfo.id;
        const refParamId = logInfo.refParamId || logInfo.id;
        const bugId = logInfo.bugId || logInfo.id;
        const feedbackId = logInfo.feedbackId || logInfo.id;
        const sessionId = logInfo.sessionId || logInfo.id;
        const requestId = logInfo.requestId || logInfo.id;
        const deviceId = logInfo.deviceId || logInfo.deviceInfoId || logInfo.id;
        const educationId = logInfo.educationId || logInfo.id;
        const experienceId = logInfo.experienceId || logInfo.id;

        return (
          <Trans
            ns="logs"
            i18nKey={`descriptions.${event}`}
            values={{
              ...logInfo,
              authorName,
              targetName,
              fullname: logInfo.fullname || targetName,
              clientName: logInfo.clientName || targetName,
              followerName: logInfo.followerName || authorName,
              followedName: logInfo.followedName || targetName,
              firstName: logInfo.firstName || targetName,
              bookmarkIdentity: logInfo.bookmarkIdentity || targetName,
              senderName: logInfo.senderName || targetName,
              label: logInfo.label || "Role",
              title: logInfo.title || logInfo.slug || "Item",
              slug: logInfo.slug || logInfo.title || "Page",
              variant: logInfo.variant || "General",
              category: logInfo.category || "General",
              platform: logInfo.platform || "Device",
              model: logInfo.model || "",
              sessionType: logInfo.sessionType || "Default",
              bugId: bugId ?? "",
              feedbackId: feedbackId ?? "",
              sessionId: sessionId ?? "",
              requestId: requestId ?? "",
              roleId: roleId ?? "",
              pageId: pageId ?? "",
              refTypeId: refTypeId ?? "",
              refParamId: refParamId ?? "",
              deviceId: deviceId ?? "",
              educationId: educationId ?? "",
              experienceId: experienceId ?? "",
              user: {
                id: row?.original?.user?.id,
                username: authorName,
              },
            }}
            components={{
              a: renderLink(
                row?.original?.user?.id
                  ? `/user-management/users/${row.original.user.id}`
                  : undefined
              ),
              userLink: renderLink(
                currentUserId
                  ? `/user-management/users/${currentUserId}`
                  : undefined
              ),
              clientLink: renderLink(
                currentUserId
                  ? `/user-management/users/${currentUserId}`
                  : undefined
              ),
              authorLink: renderLink(
                authorId ? `/user-management/users/${authorId}` : undefined
              ),
              targetUserLink: renderLink(
                targetUserId
                  ? `/user-management/users/${targetUserId}`
                  : undefined
              ),
              roleLink: renderLink(
                roleId ? `/user-management/roles/${roleId}` : undefined
              ),
              contentPageLink: renderLink(
                pageId ? `/content-management/pages/${pageId}` : undefined
              ),
              refTypeLink: renderLink(
                refTypeId
                  ? `/content-management/reference-types/${refTypeId}`
                  : undefined
              ),
              refParamLink: renderLink(
                refParamId
                  ? `/content-management/reference-parameters/${refParamId}`
                  : undefined
              ),
              bugLink: renderLink(
                bugId ? `/audit-monitoring/bug-report/${bugId}` : undefined
              ),
              feedbackLink: renderLink(
                feedbackId
                  ? `/audit-monitoring/feedback/${feedbackId}`
                  : undefined
              ),
              sessionLink: renderLink(
                sessionId ? `/sessions/${sessionId}` : undefined
              ),
              requestLink: renderLink(
                requestId ? `/requests/${requestId}` : undefined
              ),
              deviceLink: renderLink(
                deviceId ? `/device-info/${deviceId}` : undefined
              ),
              educationLink: renderLink(
                educationId ? `/education/${educationId}` : undefined
              ),
              experienceLink: renderLink(
                experienceId ? `/experience/${experienceId}` : undefined
              ),
            }}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("logger.columns.logInfo")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("logger.columns.logInfo")}
          attribute="logInfo"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const rawLogInfo = row?.original?.logInfo;
        if (
          !rawLogInfo ||
          typeof rawLogInfo !== "object" ||
          Object.keys(rawLogInfo).length === 0
        ) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        const filtered: Record<string, any> = {};
        for (const [key, value] of Object.entries(
          rawLogInfo as Record<string, any>
        )) {
          if (
            !UNNECESSARY_KEYS.has(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            filtered[key] = value;
          }
        }

        const displayData =
          Object.keys(filtered).length > 0 ? filtered : rawLogInfo;

        return <JsonToggler data={displayData} className="w-full" />;
      },
      enableSorting: false,
      enableHiding: true,
      size: 200,
    },
    {
      accessorKey: `${t("logger.columns.loggedAt")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("logger.columns.loggedAt")}
          attribute="createdAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row?.original?.createdAt);
        return (
          <DataTableCell
            variant={DataTableCellVariant.DATE_TIME}
            value={date}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
  ];
};
