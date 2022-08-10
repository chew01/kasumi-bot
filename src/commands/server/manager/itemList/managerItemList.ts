import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  roleMention,
} from 'discord.js';
import Item from '../../../../storage/models/Item';

export const managerItemListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of existing items',
  type: ApplicationCommandOptionType.Subcommand,
};

export function managerItemList(interaction: ChatInputCommandInteraction) {
  const items = Item.getAll();
  const roles = items.filter((item) => item.role_id);
  const boxes = items.filter((item) => !item.role_id && item.key_name);
  const others = items.filter((item) => !item.role_id && !item.key_name);

  let roleString = '';
  roles.forEach((role) => {
    roleString += `${roleMention(role.role_id)}\n`;
  });
  let boxString = '';
  let keyString = '';
  boxes.forEach((box) => {
    boxString += `${box.item_name}\n`;
    keyString += `${box.key_name}\n`;
  });
  let otherString = '';
  others.forEach((item) => {
    otherString += `${item.item_name}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('Item Manager')
    .addFields([
      { name: 'Roles', value: roleString || 'None' },
      { name: 'Boxes', value: boxString || 'None', inline: true },
      { name: 'Keys', value: keyString || 'None', inline: true },
      { name: 'Others', value: otherString || 'None' },
    ]);

  return interaction.reply({ embeds: [embed] });
}
