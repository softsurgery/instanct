import type { AxiosInstance } from "axios";
import type {
  ResponseFollowCountsDto,
  ResponseFollowDto,
  ResponseIsFollowingDto,
} from "../types";

export function createFollowResource(http: AxiosInstance) {
  const findFollowers = async (id: string): Promise<ResponseFollowDto[]> => {
    const response = await http.get(`/follow/${id}/followers`);
    return response.data;
  };

  const findFollowing = async (id: string): Promise<ResponseFollowDto[]> => {
    const response = await http.get(`/follow/${id}/following`);
    return response.data;
  };

  const findDataCount = async (id: string): Promise<ResponseFollowCountsDto> => {
    const response = await http.get(`/follow/${id}/data-count`);
    return response.data;
  };

  const followUser = async (id: string) => {
    const response = await http.post(`/follow/${id}/follow`);
    return response.data;
  };

  const unfollowUser = async (id: string) => {
    const response = await http.delete(`/follow/${id}/unfollow`);
    return response.data;
  };

  const findIsFollowing = async (
    id: string,
  ): Promise<ResponseIsFollowingDto> => {
    const response = await http.get(`/follow/${id}/is-following`);
    return response.data;
  };

  return {
    followUser,
    unfollowUser,
    findFollowers,
    findFollowing,
    findDataCount,
    findIsFollowing,
  };
}

export type FollowResource = ReturnType<typeof createFollowResource>;
