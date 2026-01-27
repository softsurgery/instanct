import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useIntro } from "@/contexts/IntroContext";
import { useConfigurations } from "@/hooks/content/configuration/useConfigurations";
import { cn } from "@/lib/utils";
import _ from "lodash";
import React from "react";
import { ConfigurationInput } from "./ConfigurationInput";
import { Label } from "@/components/ui/label";

interface ConfigurationPortalProps {
  className?: string;
}

export const ConfigurationPortal = ({
  className,
}: ConfigurationPortalProps) => {
  const { setIntro, clearIntro, setFloating, clearFloating } = useIntro();
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { configurations } = useConfigurations();

  React.useEffect(() => {
    setRoutes?.([
      {
        title: "Content Management",
        href: "/content-management",
      },
      {
        title: "Configuration",
        href: "/content-management/configuration",
      },
    ]);
    setIntro?.(
      "Configuration",
      "Manage and configure application properties in a structured format",
    );
    setFloating?.(
      <div className="flex gap-2 justify-center">
        <Button onClick={() => {}}>Save Changes</Button>
        <Button variant={"secondary"} onClick={() => {}}>
          Reset All
        </Button>
      </div>,
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
      clearFloating?.();
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-auto no-scrollbar container mx-auto p-1 mt-4",
        className,
      )}
    >
      {configurations?.map((configuration) => {
        return (
          <Card key={configuration.id}>
            <CardHeader>
              <CardTitle>{_.capitalize(configuration.id)}</CardTitle>
              <CardDescription>{configuration.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {Object.entries(
                _.groupBy(
                  configuration.params,
                  (param) => param.name?.split(".")[0],
                ),
              ).map(([groupKey, params]) => (
                <div
                  key={groupKey}
                  className="rounded-lg border p-4 flex flex-col gap-4"
                >
                  <h3 className="text-lg font-bold capitalize">{groupKey}</h3>

                  {params
                    .sort((a, b) => a.variant.localeCompare(b.variant))
                    .map((param) => (
                      <div
                        key={param.id}
                        className="flex flex-col lg:flex-row items-start gap-4"
                      >
                        <div className="w-full lg:w-1/4 flex flex-row lg:flex-col justify-between">
                          <Label className="font-semibold">
                            {_.startCase(
                              _.camelCase(param.name?.split(".")[1]),
                            )}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {param.description}
                          </p>
                        </div>
                        <ConfigurationInput configurationParam={param} />
                      </div>
                    ))}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
