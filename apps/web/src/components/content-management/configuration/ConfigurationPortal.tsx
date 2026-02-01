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
          <Card key={configuration.id} className="">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/70" />
                    {_.capitalize(configuration.id)}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {configuration.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-8 pt-0">
              {Object.entries(
                _.groupBy(
                  configuration.params,
                  (param) => param.name?.split(".")[0],
                ),
              ).map(([groupKey, params]) => (
                <div
                  key={groupKey}
                  className="rounded-md border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-semibold capitalize tracking-tight">
                      {groupKey}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({params.length})
                    </span>
                  </div>

                  <div className="space-y-4">
                    {params
                      .sort((a, b) => a.variant.localeCompare(b.variant))
                      .map((param) => (
                        <div
                          key={param.id}
                          className="flex flex-col gap-3 lg:flex-row lg:items-start"
                        >
                          <div className="lg:w-1/4">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium">
                                {_.startCase(
                                  _.camelCase(param.name?.split(".")[1]),
                                )}
                              </Label>
                              {param.description && (
                                <p className="text-xs text-muted-foreground">
                                  {param.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="lg:w-3/4">
                            <ConfigurationInput configurationParam={param} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
