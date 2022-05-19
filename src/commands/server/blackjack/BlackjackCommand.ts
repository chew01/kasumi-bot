import {
  ActionRowBuilder,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageComponentInteraction,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Blackjack, { cards } from '../../../modules/games/Blackjack';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class BlackjackCommand extends SlashCommand {
  public name = 'blackjack';

  public description = 'Play a game of Blackjack';

  public options: ApplicationCommandOptionData[] = [{
    name: 'bet',
    description: `Amount of ${Config.CURRENCY_NAME_PLURAL} to bet`,
    type: ApplicationCommandOptionType.Integer,
    minValue: Config.BLACKJACK_MIN_BET,
    maxValue: Config.BLACKJACK_MAX_BET,
    required: true,
  }];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!' });

    let bal = Member.getBalance(interaction.user.id);
    if (bal < bet) return interaction.reply(`You do not have enough ${Config.CURRENCY_NAME_PLURAL} to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductMoney(interaction.user.id, bet);

    // Start a new game
    const game = new Blackjack();
    const start = game.start();
    if (!start.dealerCards[0] || !start.dealerCards[1]) return interaction.reply('Could not deal cards! Try again.');

    let playerHand = '';
    let dealerHand: string;
    let playerCount: string;
    let dealerCount: string;
    let ended = false;
    let currentBet = bet;
    let description = `You bet ${CurrencyUtils.format(currentBet)}. You have ${CurrencyUtils.format(bal)} left.`;

    // Format player and dealer hand (1 concealed) and counts
    start.playerCards.forEach((card) => {
      playerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
    });
    dealerHand = `<${cards[`${start.dealerCards[0].suit},${start.dealerCards[0].rank}`]}><${cards.secret}>`;
    playerCount = `You | ${start.playerStartingCount}`;
    dealerCount = `Dealer | ${start.dealerStartingCount} + ?`;

    // Check if player is dealt natural
    const startingCheck = game.checkNatural();
    if (startingCheck === 'Player') {
      ended = true;
      dealerHand = '';
      start.dealerCards.forEach((card) => {
        dealerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
      });
      bal = Member.addMoney(interaction.user.id, currentBet * Config.BLACKJACK_MULTIPLIER);
      description = `You bet ${CurrencyUtils.format(currentBet)} and earned ${CurrencyUtils.format(currentBet * Config.BLACKJACK_MULTIPLIER)}\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
    }
    if (startingCheck === 'Draw') {
      ended = true;
      dealerHand = '';
      start.dealerCards.forEach((card) => {
        dealerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
      });
      bal = Member.addMoney(interaction.user.id, currentBet);
      description = `You bet ${CurrencyUtils.format(currentBet)} and drew!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    // Array of fields, add result if already in
    const fields = [{ name: playerCount, value: playerHand },
      { name: dealerCount, value: dealerHand }];

    const embed = new EmbedBuilder()
      .setTitle('Blackjack')
      .setDescription(description)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .addFields(fields);

    const hitButton = new ButtonBuilder()
      .setLabel('Hit')
      .setCustomId('hit')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(':hit:976034172919492629');

    const standButton = new ButtonBuilder()
      .setLabel('Stand')
      .setCustomId('stand')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(':stand:976034147757858856');

    const doubleButton = new ButtonBuilder()
      .setLabel('Double Down')
      .setCustomId('double')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(':double:976034109371609088');

    const buttons = [hitButton, standButton, doubleButton];
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons);

    if (ended) return interaction.reply({ embeds: [embed], components: [] });
    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i: MessageComponentInteraction) => ['hit', 'stand', 'double'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({
      filter,
      time: Config.BLACKJACK_INACTIVITY,
    });
    collector.on('collect', async (i) => {
      if (i.customId === 'hit') {
        game.playerHit();
        if (buttons.length === 3) {
          buttons.pop();
          row.setComponents(buttons);
        }
      }
      if (i.customId === 'stand') {
        game.playerStand();
      }
      if (i.customId === 'double') {
        game.playerDouble();
        currentBet *= 2;
      }
      const data = game.getData();

      if (data.winner !== 'None') {
        ended = true;
        playerHand = '';
        data.playerCards.forEach((card) => {
          playerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
        });
        dealerHand = '';
        data.dealerCards.forEach((card) => {
          dealerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
        });
        playerCount = `You | ${data.playerCount}`;
        dealerCount = `Dealer | ${data.dealerCount}`;
      }

      if (data.winner === 'PlayerBust') {
        playerCount = `You | ${data.playerCount} - Bust`;
      }
      if (data.winner === 'DealerBust') {
        dealerCount = `Dealer | ${data.dealerCount} - Bust`;
      }
      if (data.winner === 'Player' || data.winner === 'DealerBust') {
        bal = Member.addMoney(interaction.user.id, currentBet * Config.BLACKJACK_MULTIPLIER);
        description = `You bet ${CurrencyUtils.format(currentBet)} and earned ${CurrencyUtils.format(currentBet * Config.BLACKJACK_MULTIPLIER)}!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
      }
      if (data.winner === 'Dealer' || data.winner === 'PlayerBust') {
        description = `You bet ${CurrencyUtils.format(currentBet)} and lost!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
      }
      if (data.winner === 'Draw') {
        bal = Member.addMoney(interaction.user.id, currentBet);
        description = `You bet ${CurrencyUtils.format(currentBet)} and drew!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
      }
      if (data.winner === 'None') {
        playerHand = '';
        data.playerCards.forEach((card) => {
          playerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
        });
        playerCount = `You | ${data.playerCount}`;
      }

      const updateFields = [{ name: playerCount, value: playerHand },
        { name: dealerCount, value: dealerHand }];

      const updateEmbed = new EmbedBuilder()
        .setTitle('Blackjack')
        .setDescription(description)
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(updateFields);
      if (ended) await i.update({ embeds: [updateEmbed], components: [] });
      else await i.update({ embeds: [updateEmbed], components: [row] });
    });
    return null;
  }
}

export default new BlackjackCommand();
