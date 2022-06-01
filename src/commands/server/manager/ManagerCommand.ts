import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { managerItemList, managerItemListSC } from './itemList/managerItemList';
import { managerCreateItem, managerCreateItemSC } from './createItem/managerCreateItem';
import { managerCreateLootbox, managerCreateLootboxSC } from './createLootbox/managerCreateLootbox';
import { managerRemoveItem, managerRemoveItemSC } from './removeItem/managerRemoveItem';
import { managerRemoveLootbox, managerRemoveLootboxSC } from './removeLootbox/managerRemoveLootbox';

class ManagerCommand extends SlashCommand {
  public name: string = 'manager';

  public description: string = 'Manage items in the system';

  public options: ApplicationCommandOptionData[] = [
    managerItemListSC,
    managerCreateItemSC,
    managerCreateLootboxSC,
    managerRemoveItemSC,
    managerRemoveLootboxSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return managerItemList(interaction);
    if (subcommand === 'create_item') return managerCreateItem(interaction);
    if (subcommand === 'create_lootbox') return managerCreateLootbox(interaction);
    if (subcommand === 'remove_item') return managerRemoveItem(interaction);
    if (subcommand === 'remove_lootbox') return managerRemoveLootbox(interaction);

    return null;
  }
}

export default new ManagerCommand();
