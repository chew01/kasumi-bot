import type { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  channelMention,
  ChannelType,
  ModalBuilder,
  roleMention,
  TextInputBuilder,
  TextInputStyle,
  userMention,
} from 'discord.js';
import randomstring from 'randomstring';
import Config from '../Config';

export default class Ticket {
  public static openModal(interaction: ButtonInteraction) {
    const input = new TextInputBuilder()
      .setCustomId('ticket-input')
      .setLabel('Details')
      .setRequired(true)
      .setPlaceholder('Give us some details so we can help!')
      .setStyle(TextInputStyle.Paragraph);

    const modal = new ModalBuilder()
      .setTitle('Create a ticket')
      .setCustomId('ticket-modal')
      .addComponents([
        new ActionRowBuilder<TextInputBuilder>()
          .addComponents([input])]);

    return interaction.showModal(modal);
  }

  public static async create(interaction: ModalSubmitInteraction) {
    if (!interaction.guild || !interaction.client.user
            || !interaction.guild.members.me || !interaction.isModalSubmit()) {
      return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has('ManageChannels')
            || !interaction.guild.members.me.permissions.has('ManageRoles')) {
      return interaction.reply({
        content: 'I don\'t have permission to create a new channel/role! Contact a moderator.',
        ephemeral: true,
      });
    }

    let role = Config.getTicketModRole();
    if (!role) {
      const createdRole = await interaction.guild.roles.create({ name: 'Ticket Mod' });
      await Config.setTicketModRole(createdRole.id);
      role = createdRole.id;
    }
    if (!role) return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });

    let category = Config.getTicketCategory();
    if (!category) {
      const createdCategory = await interaction.guild.channels.create({
        name: 'tickets',
        type: ChannelType.GuildCategory,
      });
      await Config.setTicketCategory(createdCategory.id);
      category = createdCategory.id;
    }
    if (!category) return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });

    const cachedCategory = interaction.client.channels.cache.get(category);
    if (!cachedCategory || cachedCategory.type !== ChannelType.GuildCategory) {
      return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
    }

    const rand = randomstring.generate(6);
    const channel = await interaction.guild.channels.create(
      {
        name: `ticket-${rand}`,
        parent: cachedCategory,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ['ViewChannel'] },
          { id: interaction.user.id, allow: ['ViewChannel'] },
          { id: interaction.client.user.id, allow: ['ViewChannel'] },
          { id: role, allow: ['ViewChannel'] }],
      },
    );

    const text = interaction.fields.getTextInputValue('ticket-input');

    await channel.send({ content: `===============================================\n${roleMention(role)}, ${userMention(interaction.user.id)} **filed a new ticket with the following details 🎫**\n===============================================\n\n${text}` });

    return interaction.reply({
      content: `Your ticket was created at ${channelMention(channel.id)}!`,
      ephemeral: true,
    });
  }
}
