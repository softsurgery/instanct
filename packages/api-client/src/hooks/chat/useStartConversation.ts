import { useApi } from "../context/ApiContext";
import { prependConversationToPages } from "../lib/chat-cache";
import { CreateConversationDto, ResponseConversationDto } from "api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOptionalLoader } from "@softsurgery/contexts";

interface useStartConversationProps {
  onSuccess?: (conversation: ResponseConversationDto) => void;
  onError?: (error: any) => void;
}

/**
 * Hook providing a mutation to start or create a new conversation with a list of user IDs.
 */
export const useStartConversation = ({
  onSuccess,
  onError,
}: useStartConversationProps = {}) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const loader = useOptionalLoader();

  const { mutate: startConversation, isPending: isStartingConversation } =
    useMutation({
      mutationKey: ["start-conversation"],
      mutationFn: (createConverstationDto: CreateConversationDto) =>
        api.chat.conversation.createConversation(createConverstationDto),
      onMutate: () => {
        loader?.setLoading(true);
      },
      onSuccess: (conversation) => {
        queryClient.setQueriesData(
          { queryKey: ["conversations"], exact: false },
          (oldData) => prependConversationToPages(oldData as any, conversation),
        );
        onSuccess?.(conversation);
      },
      onError: (error) => {
        onError?.(error);
      },
      onSettled: () => {
        loader?.setLoading(false);
      },
    });

  return { startConversation, isStartingConversation };
};
