import fs from 'fs';
import path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import Config from '../Config';
import Logger from '../services/Logger';
import SlashCommand from '../types/SlashCommand';

export default class CommandHandler {
  private commands: Map<string, SlashCommand>;

  public constructor() {
    this.commands = new Map<string, SlashCommand>();
  }

  private async loadCommands(dir: string) {
    let commandFiles: string[] = [];
    fs.readdirSync(path.resolve(__dirname, dir), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .forEach((dirent) => {
        const commandsInDir = fs.readdirSync(path.resolve(__dirname, `${dir}/${dirent.name}`))
          .filter((filename) => filename.match(/\.([tj])s$/))
          .map((filename) => `./${dir}/${dirent.name}/${filename}`);
        commandFiles = [...commandFiles, ...commandsInDir];
      });
    await Promise.all(commandFiles.map(async (filepath) => {
      const command = await import(filepath);

      if (command.default && command.default instanceof SlashCommand) {
        this.commands.set(command.default.name, command.default);
      } else throw new Error(`Command file ${filepath} does not export a valid slash command as default.`);
    })).then(() => Logger.info(`${this.commands.size} commands loaded.`));
  }

  public async load() {
    await this.loadCommands('server');
  }

  public async update() {
    const rest = new REST({ version: '10' }).setToken(Config.DISCORD_TOKEN);

    try {
      if (Config.GUILD_ID) {
        const body = Array.from(this.commands.values())
          .map((cmd) => ({ name: cmd.name, description: cmd.description, options: cmd.options }));
        await rest.put(
          Routes.applicationGuildCommands(
            Config.BOT_CLIENT_ID,
            Config.GUILD_ID,
          ),
          { body },
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.error(err.message);
      }
    }
  }

  public async handle(name: string) {
    const command = this.commands.get(name);
    if (!command) return null;
    return command;
  }
}
