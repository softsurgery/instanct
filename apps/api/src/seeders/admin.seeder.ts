import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { adminSeed } from './data/admin.data';
import { UserRepository } from 'src/modules/users/repositories/user.repository';

@Injectable()
export class AdminSeedCommand {
  constructor(private readonly userRepository: UserRepository) {}

  @Command({
    command: 'seed:admin',
    describe: 'seed system admin',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of admin...');
    //=============================================================================================

    const adminUser = await this.userRepository.findOne({
      where: { username: 'superadmin' },
    });

    if (!adminUser) {
      await this.userRepository.save(adminSeed.profile);
    }

    //=============================================================================================
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
