// follow.service.ts
import { Injectable } from '@nestjs/common';
import { FollowCannotFollowYourselfException } from '../../../shared/abstract-user-management/errors/follow/follow.cannotfollowyourself.error';
import { UserNotFoundException } from '../../../shared/abstract-user-management/errors/user/user.notfound.error';
import { FollowNotFoundException } from '../../../shared/abstract-user-management/errors/follow/follow.notfound.error';
import { FollowRepository } from '../../../shared/abstract-user-management/repositories/follow.repository';
import { ResponseFollowDto } from '../../../shared/abstract-user-management/dtos/follow/response-follow.dto';
import { ResponseFollowCountsDto } from '../../../shared/abstract-user-management/dtos/follow/response-follow-counts.dto';
import { FollowAlreadyExistsException } from '../../../shared/abstract-user-management/errors/follow/follow.alreadyexists.error';
import { ResponseIsFollowingDto } from '../../../shared/abstract-user-management/dtos/follow/response-is-following.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class FollowService {
  constructor(
    private followRepository: FollowRepository,
    private userRepository: UserRepository,
  ) {}

  async follow(targetId: string, userId?: string) {
    if (userId === targetId) throw new FollowCannotFollowYourselfException();

    const follower = await this.userRepository.findOne({
      where: { id: userId },
    });
    const following = await this.userRepository.findOne({
      where: { id: targetId },
    });

    if (!follower || !following) throw new UserNotFoundException();

    let follow = await this.followRepository.findOne({
      where: { follower: { id: userId }, following: { id: targetId } },
    });

    if (follow) throw new FollowAlreadyExistsException();

    follow = this.followRepository.create({ follower, following });
    return this.followRepository.save(follow);
  }

  async unfollow(targetId: string, userId?: string) {
    const follower = await this.userRepository.findOne({
      where: { id: userId },
    });
    const following = await this.userRepository.findOne({
      where: { id: targetId },
    });

    if (!follower || !following) throw new UserNotFoundException();

    const follow = await this.followRepository.findOne({
      where: { follower: { id: userId }, following: { id: targetId } },
    });

    if (!follow) throw new FollowNotFoundException();
    return this.followRepository.remove(follow);
  }

  private sortByPriority(
    list: ResponseFollowDto[],
    userId?: string,
  ): ResponseFollowDto[] {
    return list.sort((a, b) => {
      const score = (item: ResponseFollowDto): number => {
        if (item.followerId === userId || item.followingId === userId) return 2; // highest priority
        if (item.isFollowing) return 1;
        return 0;
      };

      return score(b) - score(a);
    });
  }

  async getFollowers(
    targetId: string,
    userId?: string,
  ): Promise<ResponseFollowDto[]> {
    const followers = await this.followRepository.findAll({
      where: { following: { id: targetId } },
      relations: ['follower'],
    });

    const result = await Promise.all(
      followers.map(async (follower) => ({
        ...follower,
        isFollowing: (await this.isFollowing(follower.followerId, userId))
          .isFollowing,
      })),
    );

    return this.sortByPriority(result, userId);
  }

  async getFollowing(
    targetId: string,
    userId?: string,
  ): Promise<ResponseFollowDto[]> {
    const followings = await this.followRepository.findAll({
      where: { follower: { id: targetId } },
      relations: ['following'],
    });

    const result = await Promise.all(
      followings.map(async (following) => ({
        ...following,
        isFollowing: (await this.isFollowing(following.followingId, userId))
          .isFollowing,
      })),
    );

    return this.sortByPriority(result, userId);
  }

  async isFollowing(
    targetId: string,
    userId?: string,
  ): Promise<ResponseIsFollowingDto> {
    const follow = await this.followRepository.findOne({
      where: { follower: { id: userId }, following: { id: targetId } },
    });
    return {
      userId,
      targetId,
      isFollowing: !!follow,
    };
  }

  async getDataCount(userId: string): Promise<ResponseFollowCountsDto> {
    const following = await this.followRepository.getTotalCount({
      where: { follower: { id: userId } },
    });
    const followers = await this.followRepository.getTotalCount({
      where: { following: { id: userId } },
    });
    return { following, followers };
  }
}
