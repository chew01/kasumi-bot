import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import ReactCache from '../../../cache/ReactCache';

class ReactCommand extends SlashCommand {
  public name: string = 'react';

  public description: string = 'React to another user';

  public options: ApplicationCommandOptionData[] = [
    {
      name: 'type',
      description: 'Type of reaction',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'user',
      description: 'User to react to',
      type: ApplicationCommandOptionType.User,
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const type = interaction.options.getString('type');
    if (!type) return interaction.reply({ content: 'You did not choose a valid type. Try again!' });
    const user = interaction.options.getUser('user');

    const rxn = ReactCache.getRandom(type);
    if (!rxn) {
      let typeField = '';
      const types = ReactCache.getTypes();
      types.forEach((t) => {
        typeField += `${t}\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('Oops!')
        .setDescription('That type of reaction does not exist!')
        .addFields([{ name: 'Available Reactions', value: typeField || 'None' }]);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setDescription(`**${interaction.user.username} sent a '${type}' reaction ${user ? `to ${user.username}` : ''}**`)
      .setImage(rxn.url)
      .setFooter({ text: rxn.id });

    return interaction.reply({ embeds: [embed] });
  }
}

export default new ReactCommand();
