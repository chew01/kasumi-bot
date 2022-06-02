import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Box from '../../../../storage/models/Box';
import Item from '../../../../storage/models/Item';
import Lootbox from '../../../../modules/Lootbox';

export const managerAddLootboxRoleSC: ApplicationCommandSubCommandData = {
  name: 'add_lootbox_role',
  description: 'Add a reward role to a lootbox',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'role',
      description: 'Role to be rewarded',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'odds',
      description: 'Odds of getting the item (in %)',
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      max_value: 100,
      required: true,
    },
  ],
};

export function managerAddLootboxRole(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });
  const odds = interaction.options.getInteger('odds');
  if (odds === null) return interaction.reply({ content: 'You did not choose a valid odds value. Try again!' });

  const existingBox = Box.getOne(box);
  if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });
  const existingItem = Item.getByRoleId(role.id);
  if (!existingItem) return interaction.reply({ content: 'That role is not in the database!' });

  Lootbox.addReward(box, existingBox.rewards, existingItem.item_name, 1, odds);

  return interaction.reply({ content: `Successfully added **${role.name}** to **${box}** (${odds}% chance)` });
}
