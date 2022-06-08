import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';
import GiveawayManager from '../../../../modules/GiveawayManager';

export const giveawayAddRoleSC: ApplicationCommandSubCommandData = {
  name: 'add_role',
  description: 'Add a role check to a giveaway',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'message_id',
      description: 'Message ID of the giveaway',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'role',
      description: 'Role to be added',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'type',
      description: 'Type of role check',
      type: ApplicationCommandOptionType.String,
      choices: [{ name: 'Required', value: 'Required' }, { name: 'Bypass', value: 'Bypass' }, { name: 'Multiplier', value: 'Multiplier' }],
      required: true,
    },
    {
      name: 'multiplier',
      description: 'Number of entries for the role (should only be used with multiplier check)',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
    },
  ],
};

export async function giveawayAddRole(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild()) {
    return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
  }

  const mid = interaction.options.getString('message_id');
  const role = interaction.options.getRole('role');
  const type = interaction.options.getString('type');
  const multiplier = interaction.options.getInteger('multiplier');

  if (!mid || !role || !type) return interaction.reply({ content: 'You did not give valid values for all parameters.', ephemeral: true });
  if (multiplier && type !== 'Multiplier') return interaction.reply({ content: 'Multiplier should only be filled in if you\'re adding a Multiplier Role.', ephemeral: true });

  if (!GiveawayManager.checkExists(mid)) return interaction.reply({ content: 'That message ID does not belong to an ongoing giveaway!' });

  let result;

  if (type === 'Required') {
    result = await GiveawayManager.addRole(mid, 0, role.id);
  }
  if (type === 'Bypass') {
    result = await GiveawayManager.addRole(mid, 1, role.id);
  }
  if (type === 'Multiplier') {
    if (!multiplier) return interaction.reply({ content: 'The multiplier parameter is necessary if you\'re adding a Multiplier Role.', ephemeral: true });
    result = await GiveawayManager.addRole(mid, 2, role.id, multiplier);
  }

  if (!result) return interaction.reply({ content: 'Error! Could not access and edit that giveaway.', ephemeral: true });
  return interaction.reply({ content: 'Edit successful!', ephemeral: true });
}
