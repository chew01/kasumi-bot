import type { Collection, MessageReaction } from 'discord.js';
import {
  Attachment, ChannelType, Embed, EmbedBuilder,
} from 'discord.js';
import fs from 'fs';
import Logger from '../services/Logger';
import Star from '../storage/models/Star';

const Settings = require('../../config/settings.json');

export default class Starboard {
  public static async setSettings(
    quota: number,
    emoji: string,
    channel: string,
  ): Promise<void> {
    Settings.starboard.quota = quota;
    Settings.starboard.emoji = emoji;
    Settings.starboard.channel = channel;
    await fs.writeFile(`${__dirname}/../../config/settings.json`, JSON.stringify(Settings, null, 2), (err) => {
      if (err) { Logger.error(err.message); }
    });
  }

  public static getSettings(): { quota: number, emoji: string, channel: string } {
    return {
      quota: Settings.starboard.quota,
      emoji: Settings.starboard.emoji,
      channel: Settings.starboard.channel,
    };
  }

  public static getEmoji(): string {
    return Settings.starboard.emoji.replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/, '$3');
  }

  private static handleAttachmentAndEmbeds(
    embed: EmbedBuilder,
    embeds: Embed[],
    attachments: Collection <string, Attachment>,
  ): void {
    // Check embeds for image
    const firstEmbed = embeds[0];
    if (firstEmbed && firstEmbed.data.type === 'image' && firstEmbed.thumbnail) {
      // We're using thumbnail url here because instagram and imgur.
      // Still works though!
      embed.setImage(firstEmbed.thumbnail.url);
    }

    // Check attachments
    // setImage is overridden if img because attachment takes precedence.
    const firstAttachment = attachments.at(0);
    if (firstAttachment) {
      const { url, name } = firstAttachment;
      const splittedFileUrl = url.split('.');
      const imageType = splittedFileUrl[splittedFileUrl.length - 1];
      if (imageType && /(jpg|jpeg|png|gif|webp)/gi.test(imageType)) {
        embed.setImage(url);
      } else {
        // It is an attachment that is not an image, send as attachment.
        embed.addFields([{ name: 'Attachment', value: `[${name}](${url})` }]);
      }
    }
  }

  public static async checkAddedReaction(reaction: MessageReaction) {
    const { quota, emoji, channel } = this.getSettings();
    if (!quota || !emoji || !channel) return; // Exit if settings not populated
    if (!reaction.message.author || reaction.message.author.bot) return; // Exit if no author / bot
    if (reaction.emoji.name !== this.getEmoji() && reaction.emoji.id !== this.getEmoji()) return;
    if (reaction.count < quota) return;

    const starboardChannel = reaction.client.channels.cache.get(this.getSettings().channel);
    if (!starboardChannel || starboardChannel.type !== ChannelType.GuildText) return;

    const boardId = Star.getBoardId(reaction.message.id);

    // If post does not exist, create post
    if (!boardId) {
      const guildNick = reaction.message.member?.nickname;
      const username = reaction.message.author.tag;
      const authorString = `${guildNick ? `${guildNick}, aka ` : ''}${username}`;
      const link = `**[Message Link](${reaction.message.url})**`;
      const attachment = reaction.message.attachments;

      const embed = new EmbedBuilder()
        .setAuthor({ name: authorString, iconURL: reaction.message.author.displayAvatarURL() })
        .setDescription(reaction.message.content || null)
        .setTimestamp(reaction.message.createdTimestamp)
        .addFields([{ name: 'Original', value: link }]);
      this.handleAttachmentAndEmbeds(embed, reaction.message.embeds, attachment);

      const desc = `**${reaction.count}** ${emoji} **In:** ${reaction.message.channel}`;
      const msg = await starboardChannel.send({ content: desc, embeds: [embed] });

      Star.add(reaction.message.id, msg.id);
      return;
    }

    // If post exists, update post
    const starboardPost = await starboardChannel.messages.fetch(boardId);
    if (!starboardPost) return;
    const desc = `**${reaction.count}** ${emoji} **In:** ${reaction.message.channel}`;
    await starboardPost.edit({ content: desc });
  }

  public static async checkRemovedReaction(reaction: MessageReaction) {
    const { quota, emoji, channel } = this.getSettings();
    if (!quota || !emoji || !channel) return; // Exit if settings not populated
    if (!reaction.message.author || reaction.message.author.bot) return; // Exit if no author / bot
    if (reaction.emoji.name !== this.getEmoji() && reaction.emoji.id !== this.getEmoji()) return;

    const starboardChannel = reaction.client.channels.cache.get(this.getSettings().channel);
    if (!starboardChannel || starboardChannel.type !== ChannelType.GuildText) return;

    const boardId = Star.getBoardId(reaction.message.id);
    if (!boardId) return;
    const starboardPost = await starboardChannel.messages.fetch(boardId);
    if (!starboardPost) return;

    if (reaction.count >= quota) {
      const desc = `**${reaction.count}** ${emoji} **In:** ${reaction.message.channel}`;
      await starboardPost.edit({ content: desc });
    } else {
      await starboardPost.delete();
      Star.remove(boardId);
    }
  }
}
