import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { managerItemList, managerItemListSC } from './itemList/managerItemList';
import { managerCreateItem, managerCreateItemSC } from './createItem/managerCreateItem';
import { managerCreateLootbox, managerCreateLootboxSC } from './createLootbox/managerCreateLootbox';
import { managerRemoveItem, managerRemoveItemSC } from './removeItem/managerRemoveItem';
import { managerRemoveLootbox, managerRemoveLootboxSC } from './removeLootbox/managerRemoveLootbox';
import { managerInspectLootbox, managerInspectLootboxSC } from './inspectLootbox/managerInspectLootbox';
import { managerSetLootboxCoins, managerSetLootboxCoinsSC } from './setLootboxCoins/managerSetLootboxCoins';
import { managerAddLootboxReward, managerAddLootboxRewardSC } from './addLootboxReward/managerAddLootboxReward';
import {
  managerRemoveLootboxReward,
  managerRemoveLootboxRewardSC,
} from './removeLootboxReward/managerRemoveLootboxReward';
import { managerCreateRole, managerCreateRoleSC } from './createRole/managerCreateRole';
import { managerRemoveRole, managerRemoveRoleSC } from './removeRole/managerRemoveRole';
import { managerAddLootboxRole, managerAddLootboxRoleSC } from './addLootboxRole/managerAddLootboxRole';

class ManagerCommand extends SlashCommand {
  public name: string = 'manager';

  public description: string = 'Manage items in the system';

  public options: ApplicationCommandOptionData[] = [
    managerItemListSC,
    managerCreateItemSC,
    managerCreateLootboxSC,
    managerCreateRoleSC,
    managerRemoveItemSC,
    managerRemoveLootboxSC,
    managerRemoveRoleSC,
    managerInspectLootboxSC,
    managerSetLootboxCoinsSC,
    managerAddLootboxRewardSC,
    managerRemoveLootboxRewardSC,
    managerAddLootboxRoleSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return managerItemList(interaction);
    if (subcommand === 'create_item') return managerCreateItem(interaction);
    if (subcommand === 'create_lootbox') return managerCreateLootbox(interaction);
    if (subcommand === 'create_role') return managerCreateRole(interaction);
    if (subcommand === 'remove_item') return managerRemoveItem(interaction);
    if (subcommand === 'remove_lootbox') return managerRemoveLootbox(interaction);
    if (subcommand === 'remove_role') return managerRemoveRole(interaction);
    if (subcommand === 'inspect_lootbox') return managerInspectLootbox(interaction);
    if (subcommand === 'set_lootbox_coins') return managerSetLootboxCoins(interaction);
    if (subcommand === 'add_lootbox_reward') return managerAddLootboxReward(interaction);
    if (subcommand === 'remove_lootbox_reward') return managerRemoveLootboxReward(interaction);
    if (subcommand === 'add_lootbox_role') return managerAddLootboxRole(interaction);

    return null;
  }
}

export default new ManagerCommand();
