import { execSync, spawnSync } from 'child_process';
import * as prompts from 'prompts';

async function run() {
  console.log('🔍 Detecting available seeders...');

  let helpOutput: string;
  try {
    helpOutput = execSync('npx nestjs-command --help', { encoding: 'utf-8' });
  } catch (error: unknown) {
    // npx nestjs-command --help might exit with code 1, but we still get stdout
    const err = error as { stdout?: string; message?: string };
    helpOutput = err.stdout || err.message || '';
  }

  // Parse lines that start with "cli seed:"
  const lines = helpOutput.split('\n');
  const seeders: { command: string; description: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('cli seed:')) {
      // e.g. "cli seed:permissions               seed system permissions"
      // Remove "cli "
      const withoutCli = trimmed.substring(4);
      // Match the command and description
      const match = withoutCli.match(/^(seed:[\w-]+)\s+(.*)$/);
      if (match) {
        seeders.push({
          command: match[1],
          description: match[2].trim(),
        });
      }
    }
  }

  if (seeders.length === 0) {
    console.error(
      '❌ Could not detect any seeders. Ensure nestjs-command is working correctly.',
    );
    process.exit(1);
  }

  const { action } = await prompts({
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      {
        title: 'Seed All',
        value: 'all',
        description: 'Run all detected seeders sequentially',
      },
      {
        title: 'Select Specific Seeders',
        value: 'specific',
        description: 'Choose which seeders to run',
      },
      { title: 'Cancel', value: 'cancel' },
    ],
  });

  if (!action || action === 'cancel') {
    console.log('Canceled.');
    process.exit(0);
  }

  let seedersToRun: typeof seeders = [];

  if (action === 'all') {
    seedersToRun = seeders;
  } else if (action === 'specific') {
    const { selected } = (await prompts({
      type: 'multiselect',
      name: 'selected',
      message:
        'Select the seeders you want to run (Space to select, Enter to confirm)',
      choices: seeders.map((s) => ({
        title: s.command,
        description: s.description,
        value: s,
      })),
      min: 1,
    })) as { selected?: typeof seeders };

    if (!selected || selected.length === 0) {
      console.log('No seeders selected. Canceled.');
      process.exit(0);
    }
    seedersToRun = selected;
  }

  console.log(`\n🚀 Starting ${seedersToRun.length} seeder(s)...\n`);

  for (const seeder of seedersToRun) {
    console.log(`\n=============================================`);
    console.log(`Executing: ${seeder.command} (${seeder.description})`);
    console.log(`=============================================\n`);

    const result = spawnSync('npx', ['nestjs-command', seeder.command], {
      stdio: 'inherit',
      shell: true,
    });

    if (result.status !== 0) {
      console.error(
        `\n❌ Error: ${seeder.command} failed with exit code ${result.status}. Stopping execution.`,
      );
      process.exit(1);
    }
  }

  console.log('\n✅ All selected seeders completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
