import { ApplicationCommandOptionData, CommandInteraction, EmbedBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Inventory from '../../../storage/models/Inventory';

class InventoryCommand extends SlashCommand {
  public name: string = 'inventory';

  public description: string = 'Check your inventory';

  options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    const inventory = Inventory.get(interaction.user.id);
    let itemNames = '';
    let itemQty = '';

    inventory.forEach((item) => {
      itemNames += `${item.item_name}\n`;
      itemQty += `${item.quantity}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle('Inventory')
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setDescription('Here are your items:')
      .addFields([{ name: 'Item', value: itemNames || 'None', inline: true },
        { name: 'Quantity', value: itemQty || 'None', inline: true }]);

    return interaction.reply({ embeds: [embed] });
  }
}

export default new InventoryCommand();
