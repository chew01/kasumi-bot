import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Inventory from '../../../storage/models/Inventory';
import Box from '../../../storage/models/Box';
import Config from '../../../Config';
import Lootbox from '../../../modules/Lootbox';
import Item from '../../../storage/models/Item';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';

class UseCommand extends SlashCommand {
  public name: string = 'use';

  public description: string = 'Use a loot box';

  options: ApplicationCommandOptionData[] = [
    {
      name: 'box',
      description: 'Name of the loot box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()
        || !interaction.inCachedGuild()) return interaction.reply({ content: Config.ERROR_MSG });

    const box = interaction.options.getString('box');
    if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });

    const existingBox = Box.getOne(box);
    if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });

    const boxQty = Inventory.getQuantityOwned(interaction.user.id, box);
    if (boxQty < 1) return interaction.reply({ content: `You do not have a ${box} to open!` });
    const keyQty = Inventory.getQuantityOwned(interaction.user.id, existingBox.key_name);
    if (keyQty < 1) return interaction.reply({ content: 'You do not have sufficient keys for that loot box!' });

    // Get results from lootbox usage
    const { coins, rewards } = Lootbox.use(existingBox);
    Member.addMoney(interaction.user.id, coins);
    let rewardString = `You received **${CurrencyUtils.formatEmoji(coins)}**\n`;

    // For each reward
    const promises = rewards.map(async (reward) => {
      // Get item data from the database
      const item = Item.getOne(reward.item);
      if (item) {
        // If item is a role
        if (item.role_id && !interaction.member.roles.cache.has(item.role_id)) {
          await interaction.member.roles.add(item.role_id);
          rewardString += `You have gained the **${item.item_name}** role!\n`;
        }

        // If item is not a role
        if (!item.role_id) {
          Inventory.give(interaction.user.id, item.item_name, reward.qty);
          rewardString += `You received **${reward.qty} ${item.item_name}**!\n`;
        }
      }
    });

    await Promise.all(promises);
    Inventory.take(interaction.user.id, box, 1);
    Inventory.take(interaction.user.id, existingBox.key_name, 1);

    return interaction.reply({ content: rewardString });
  }
}

export default new UseCommand();
