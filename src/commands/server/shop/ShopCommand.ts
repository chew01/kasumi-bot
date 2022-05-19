import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import { shopList, shopListSC } from './list/shopList';
import Config from '../../../Config';
import { shopAddRole, shopAddRoleSC } from './addRole/shopAddRole';
import { shopDelRole, shopDelRoleSC } from './delRole/shopDelRole';
import { shopAddItem, shopAddItemSC } from './addItem/shopAddItem';
import { shopDelItem, shopDelItemSC } from './delItem/shopDelItem';
import { shopBuyRole, shopBuyRoleSC } from './buyRole/shopBuyRole';
import { shopBuyItem, shopBuyItemSC } from './buyItem/shopBuyItem';

class ShopCommand extends SlashCommand {
  public name: string = 'shop';

  public description: string = 'Access the server shop';

  public options: ApplicationCommandOptionData[] = [
    shopListSC,
    shopAddRoleSC,
    shopDelRoleSC,
    shopAddItemSC,
    shopDelItemSC,
    shopBuyRoleSC,
    shopBuyItemSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return shopList(interaction);

    if (subcommand === 'add_role_listing') return shopAddRole(interaction);

    if (subcommand === 'del_role_listing') return shopDelRole(interaction);

    if (subcommand === 'add_item_listing') return shopAddItem(interaction);

    if (subcommand === 'del_item_listing') return shopDelItem(interaction);

    if (subcommand === 'buy_role') return shopBuyRole(interaction);

    if (subcommand === 'buy_item') return shopBuyItem(interaction);

    return null;
  }
}

export default new ShopCommand();
