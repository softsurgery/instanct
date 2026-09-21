import { Command, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { mockUsersSeed } from '../data/playground-users.data';
import { UserService } from 'src/modules/users/services/user.service';

@Injectable()
export class PlaygroundUsersSeedCommand {
  constructor(private readonly userService: UserService) {}

  @Command({
    command: 'seed:playground-users',
    describe: 'seed playground users',
  })
  async seed(
    @Option({
      name: 'userId',
      describe: 'Seed a specific user by ID',
      type: 'string',
      required: false,
    })
    userId?: string,
  ) {
    const start = new Date();
    console.log('🚀 Starting seeding of playground users...');
    //=============================================================================================

    const seedUser = async (userId: string) => {
      const existsInSeedData = mockUsersSeed.find((u) => u.core.id === userId);
      if (existsInSeedData) {
        const exists = await this.userService.findOneByCondition({
          filter: `id||$eq||${userId}`,
        });
        if (exists) {
          console.log(
            `⚠️ User already exists: ${existsInSeedData.core.username}`,
          );
          return;
        }
        await this.userService.extendedSave({
          ...existsInSeedData.core,
          ...existsInSeedData.profile,
        });
        console.log(`✅ Created user: ${existsInSeedData.core.username}`);
      } else {
        console.log(`⚠️ User not found in seed data: ${userId}`);
      }
    };

    if (!userId) {
      for (const user of mockUsersSeed) {
        await seedUser(user.core.id);
      }
    } else {
      await seedUser(userId);
    }

    //=============================================================================================
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
