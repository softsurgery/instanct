import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/user-management/repositories/user.repository';
import { ProfileRepository } from 'src/modules/user-management/repositories/profile.repository';
import { UserService } from 'src/modules/user-management/services/user.service';
import { adminSeed } from './data/admin.data';

@Injectable()
export class AdminSeedCommand {
  constructor(
    private readonly userservice: UserService,
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  @Command({
    command: 'seed:admin',
    describe: 'seed system admin',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of admin...');
    //=============================================================================================

    let adminUser = await this.userRepository.findOne({
      where: { username: 'superadmin' },
    });

    if (!adminUser) {
      const profile = await this.profileRepository.save(adminSeed.profile);

      adminUser = await this.userservice.save({
        ...adminSeed.core,
        profileId: profile.id,
      });
    }

    //=============================================================================================
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
