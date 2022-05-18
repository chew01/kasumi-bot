import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Inventory from '../../../storage/Inventory';
import MemberCache from '../../../cache/MemberCache';

class InventoryCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const init = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!init) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const inventory = Inventory.get(interaction.user.id);
    if (!inventory) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    return interaction.reply({ content: 'You currently have inventory.', ephemeral: true }); // TODO: Inventory display
  }
}

export const builder = new SlashCommandBuilder().setName('inventory').setDescription('Checks your inventory.');

export default new InventoryCommand();
