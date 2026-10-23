import { StableScrollView } from "@softsurgery/mobile-components";
import { Button } from "@softsurgery/mobile-ui";
import { Dialog, DialogContent, DialogTrigger } from "@softsurgery/mobile-ui";
import { Icon } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { useMapStore } from "@/stores/useMapStore";
import { Cog } from "lucide-react-native";

interface MapDebugDialogProps {
  className?: string;
}

export const MapDebugDialog = ({ className }: MapDebugDialogProps) => {
  const mapStore = useMapStore();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon"} className={className}>
          <Icon as={Cog} size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-96 flex flex-col p-0 w-[90vw]">
        <StableScrollView className="flex-1 px-4">
          <Text className="text-xs">{JSON.stringify(mapStore, null, 2)}</Text>
        </StableScrollView>
      </DialogContent>
    </Dialog>
  );
};
