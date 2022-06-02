import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Formatters,
} from 'discord.js';
import Shop from '../../../../storage/models/Shop';

export const shopListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of all shop listings',
  type: ApplicationCommandOptionType.Subcommand,
};

export function shopList(interaction: ChatInputCommandInteraction) {
  let names = '';
  let types = '';
  let prices = '';
  const listings = Shop.getListings();
  if (listings) {
    listings.forEach((listing) => {
      names += `${listing.role_id ? Formatters.roleMention(listing.role_id) : listing.item_name}\n`;
      types += `${listing.role_id ? 'ROLE' : 'ITEM'}\n`;
      prices += `${listing.price}\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('Server Shop')
    .setDescription('Here are the items available:')
    .addFields([{ name: 'Name', value: names || 'None', inline: true },
      { name: 'Type', value: types || 'None', inline: true },
      { name: 'Price', value: prices || 'None', inline: true }]);

  return interaction.reply({ embeds: [embed] });
}
