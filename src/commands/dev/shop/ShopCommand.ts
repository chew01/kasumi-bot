import {
  CommandInteraction, EmbedBuilder, Formatters, SlashCommandBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Shop from '../../../storage/Shop';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Item from '../../../storage/Item';
import Inventory from '../../../storage/Inventory';
import Member from '../../../storage/Member';

class ShopCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      let names = '';
      let types = '';
      let prices = '';
      const listings = Shop.getAll();
      if (listings) {
        listings.forEach((listing) => {
          names += `${listing.item_name}\n`;
          types += `${listing.role_id ? 'ROLE' : 'ITEM'}\n`;
          prices += `${listing.price}\n`;
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Shop')
        .setDescription('Here are the items available:')
        .addFields([{ name: 'Name', value: names || 'None', inline: true },
          { name: 'Type', value: types || 'None', inline: true },
          { name: 'Price', value: prices || 'None', inline: true }]);

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'add_role_listing') {
      const role = interaction.options.getRole('role');
      if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });
      const price = interaction.options.getInteger('price');
      if (price === null) return interaction.reply({ content: 'You did not choose a valid price. Try again!' });

      if (!interaction.client.user) return null;
      // @ts-ignore
      if (interaction.guild?.roles.botRoleFor(interaction.client.user)?.comparePositionTo(role.id) < 0) return interaction.reply({ content: 'The role is above the bot!' });

      const check = Shop.checkExists(role.name);
      if (check) return interaction.reply({ content: 'The role you chose is already in the shop.' });

      const operation = Shop.addRole(role.name, role.id, price);
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      return interaction.reply({ content: `Successfully listed ${Formatters.roleMention(role.id)} for ${CurrencyUtils.format(price)}.` });
    }

    if (subcommand === 'del_role_listing') {
      const role = interaction.options.getRole('role');
      if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

      const check = Shop.checkExists(role.name);
      if (check === null) return interaction.reply({ content: 'The role you chose is not in the shop.' });

      const operation = Shop.removeRole(role.id);
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      return interaction.reply({ content: `Successfully delisted ${Formatters.roleMention(role.id)}.` });
    }

    if (subcommand === 'add_item_listing') {
      const item = interaction.options.getString('item');
      if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });
      const price = interaction.options.getInteger('price');
      if (price === null) return interaction.reply({ content: 'You did not choose a valid price. Try again!' });

      const checkExists = Item.getOne(item);
      if (checkExists === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      if (checkExists === undefined) return interaction.reply({ content: 'That item does not exist!' });

      const checkShop = Shop.checkExists(item);
      if (checkShop) return interaction.reply({ content: 'The item you chose is already in the shop.' });

      const operation = Shop.addItem(item, price);
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      return interaction.reply({ content: `Successfully listed ${item} for ${CurrencyUtils.format(price)}.` });
    }

    if (subcommand === 'del_item_listing') {
      const item = interaction.options.getString('item');
      if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });

      const checkShop = Shop.checkExists(item);
      if (!checkShop) return interaction.reply({ content: 'The item you chose is not in the shop.' });

      const operation = Shop.removeItem(item);
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      return interaction.reply({ content: `Successfully delisted ${item}.` });
    }

    if (subcommand === 'buy_role') {
      if (!interaction.inCachedGuild()) return null;
      const role = interaction.options.getRole('role');
      if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

      if (!interaction.client.user) return null;
      // @ts-ignore
      if (interaction.guild?.roles.botRoleFor(interaction.client.user)?.comparePositionTo(role.id) < 0) return interaction.reply({ content: 'The role is above the bot!' });

      const check = Shop.checkPrice(role.name);
      if (check === null) return interaction.reply({ content: 'The role you chose is not in the shop.' });

      const checkOwn = Inventory.checkIfOwns(interaction.user.id, role.name);
      if (checkOwn) return interaction.reply({ content: 'You already own this role!' });
      if (checkOwn === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });

      const buy = Shop.buyRole(interaction.user.id, role.name);
      const bal = Member.getCoin(interaction.user.id);
      if (buy === false) return interaction.reply({ content: `You do not have enough coins! You only have ${CurrencyUtils.formatEmoji(bal || 0)}` });
      if (buy === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });

      await interaction.member.roles.add(role);

      return interaction.reply({ content: `You bought ${role}! You can use it in your inventory. You now have ${CurrencyUtils.formatEmoji(bal || 0)}` });
    }

    if (subcommand === 'buy_item') {
      const item = interaction.options.getString('item');
      if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });

      const qty = interaction.options.getInteger('quantity');
      if (!qty) return interaction.reply({ content: 'You did not choose a valid quantity. Try again!' });

      const checkShop = Shop.checkExists(item);
      if (!checkShop) return interaction.reply({ content: 'The item you chose is not in the shop.' });

      const buy = Shop.buyItem(interaction.user.id, item, qty);
      const bal = Member.getCoin(interaction.user.id);

      if (buy === false) return interaction.reply({ content: `You do not have enough coins! You only have ${CurrencyUtils.formatEmoji(bal || 0)}` });
      if (buy === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
      return interaction.reply({ content: `You bought ${qty}x ${item}! You now have ${CurrencyUtils.formatEmoji(bal || 0)}` });
    }

    return null;
  }
}

export const builder = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Access the server shop!')
  .addSubcommand((sub) => sub
    .setName('list')
    .setDescription('Get a list of all items in the shop'))
  .addSubcommand((sub) => sub
    .setName('add_role_listing')
    .setDescription('Add a role listing to the shop')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('The role to be sold')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('price')
      .setDescription('The price the role should be sold at')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('add_item_listing')
    .setDescription('Add an item listing to the shop')
    .addStringOption((option) => option
      .setName('item')
      .setDescription('The item to be sold')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('price')
      .setDescription('The price the item should be sold at')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('del_role_listing')
    .setDescription('Remove a role listing to the shop')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('The role to be removed')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('del_item_listing')
    .setDescription('Remove an item listing to the shop')
    .addStringOption((option) => option
      .setName('item')
      .setDescription('The item to be removed')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('buy_role')
    .setDescription('Buy a role from the shop')
    .addRoleOption((option) => option
      .setName('role')
      .setDescription('The role to be bought')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('buy_item')
    .setDescription('Buy an item from the shop')
    .addStringOption((option) => option
      .setName('item')
      .setDescription('The item to be bought')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('quantity')
      .setDescription('The number of items to be bought')
      .setRequired(true)));

export default new ShopCommand();
