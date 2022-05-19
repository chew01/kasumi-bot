import chalk from 'chalk';
import BotEventHandler from '../types/BotEventHandler';
import Logger from '../services/Logger';
import type ExtendedClient from '../ExtendedClient';
import Config from '../Config';

class ReadyEventHandler extends BotEventHandler {
  name = 'ready';

  once = true;

  async execute(client: ExtendedClient) {
    if (!client.user) return;
    client.user.setActivity(Config.ACTIVITY_DESCRIPTION, { type: Config.ACTIVITY_TYPE });
    Logger.info(chalk.green.bold(`Ready! Bot logged in as ${client.user.tag}`));
  }
}

export default new ReadyEventHandler();
