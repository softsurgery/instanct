import { useMapStore } from "@/stores/useMapStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  SliderFieldProps,
  SwitchFieldProps,
} from "@softsurgery/mobile-form-builder";
import React from "react";
import { useTranslation } from "react-i18next";

export interface MapSettingsSection {
  key: string;
  title: string;
  description: string;
  structure: FormStructure;
}

export interface UseMapSettingsFormStructureProps {
  isPending?: boolean;
}

export interface UseMapSettingsFormStructureResult {
  sections: MapSettingsSection[];
}

export const useMapSettingsFormStructure = ({
  isPending = false,
}: UseMapSettingsFormStructureProps = {}): UseMapSettingsFormStructureResult => {
  const { t } = useTranslation("settings");
  const mapStore = useMapStore();

  const step = React.useMemo(() => {
    const range = mapStore.parameters.rangeMax - mapStore.parameters.rangeMin;
    return Math.max(1, Math.floor(range / 20));
  }, [mapStore.parameters.rangeMax, mapStore.parameters.rangeMin]);

  const radiusField: Field<SliderFieldProps> = {
    id: "radius",
    label: t("map-settings.discovery-range.search-radius"),
    variant: FieldVariant.SLIDER,
    props: {
      value: mapStore.draftSettings.radius,
      minimumValue: mapStore.parameters.rangeMin,
      maximumValue: mapStore.parameters.rangeMax,
      step,
      unit: "km",
      editable: !isPending,
      onValueChange: (value: number) => {
        mapStore.setNested("draftSettings.radius", value);
      },
      onSlidingComplete: (value: number) => {
        mapStore.setNested("draftSettings.radius", value);
      },
    },
  };

  const showUsernamesField: Field<SwitchFieldProps> = {
    id: "showUsernames",
    label: t("map-settings.display-preferences.show-usernames.title"),
    description: t(
      "map-settings.display-preferences.show-usernames.description",
    ),
    variant: FieldVariant.SWITCH,
    props: {
      checked: mapStore.draftSettings.showUsernames,
      editable: !isPending,
      onCheckedChange: (checked: boolean) => {
        mapStore.setNested("draftSettings.showUsernames", checked);
      },
    },
  };

  const sections: MapSettingsSection[] = [
    {
      key: "discovery",
      title: t("map-settings.discovery-range.title"),
      description: t("map-settings.discovery-range.description"),
      structure: {
        title: "",
        isHeaderVisible: false,
        fieldsets: [
          {
            isHeaderVisible: false,
            rows: [
              {
                id: 1,
                fields: [radiusField],
              },
            ],
          },
        ],
      },
    },
    {
      key: "display",
      title: t("map-settings.display-preferences.title"),
      description: t("map-settings.display-preferences.description"),
      structure: {
        title: "",
        isHeaderVisible: false,
        fieldsets: [
          {
            isHeaderVisible: false,
            rows: [
              {
                id: 2,
                fields: [showUsernamesField],
              },
            ],
          },
        ],
      },
    },
  ];

  return { sections };
};
