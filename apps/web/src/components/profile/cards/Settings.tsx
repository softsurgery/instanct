import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@instanct/ui";
import { Edit, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@instanct/ui";
import { Separator } from "@instanct/ui";

interface SettingsProps {
  className?: string;
}

export const Settings = ({ className }: SettingsProps) => {
  const { t } = useTranslation("user-management"); 

  return (
    <Card className={`${className} flex flex-col overflow-auto h-full`}>
      <CardHeader>
        <CardTitle>{t("userManagement.inspect.settings.title")}</CardTitle>
        <CardDescription>{t("userManagement.inspect.settings.manageAccount")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 ">
        {/* Account */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("userManagement.inspect.settings.account")}</h3>
          <p className="text-muted-foreground">{t("userManagement.inspect.settings.updateAccount")}</p>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t("userManagement.inspect.settings.editAccount")}
          </Button>
        </div>

        <Separator />

        {/* Privacy */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("userManagement.inspect.settings.privacy")}</h3>
          <p className="text-muted-foreground">{t("userManagement.inspect.settings.managePrivacy")}</p>
          <Button variant="outline" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t("userManagement.inspect.settings.privacySettings")}
          </Button>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("userManagement.inspect.settings.notifications")}</h3>
          <p className="text-muted-foreground">{t("userManagement.inspect.settings.configureNotifications")}</p>
          <Button variant="outline" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t("userManagement.inspect.settings.notificationSettings")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
