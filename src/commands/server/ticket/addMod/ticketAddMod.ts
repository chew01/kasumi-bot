import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';

export const ticketAddModSC: ApplicationCommandSubCommandData = {
  name: 'add_mod',
  description: 'Give the Ticket Mod role to a user',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'user',
      description: 'The user to give the Ticket Mod role to',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
};

export async function ticketAddMod(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild()) return interaction.reply({ content: Config.ERROR_MSG });

  const user = interaction.options.getMember('user');
  if (!user) return interaction.reply({ content: 'You did not choose a valid user. Try again!' });

  let role = Config.getTicketModRole();
  if (!role) {
    const createdRole = await interaction.guild.roles.create({ name: 'Ticket Mod' });
    await Config.setTicketModRole(createdRole.id);
    role = createdRole.id;
  }
  if (!role) return interaction.reply({ content: Config.ERROR_MSG });
  await user.roles.add(role);

  return interaction.reply({ content: `**${user.user.tag}** was given the **Ticket Mod** role.` });
}
