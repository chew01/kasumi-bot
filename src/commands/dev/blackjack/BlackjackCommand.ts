import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Blackjack from '../../../modules/Blackjack';
import Member from '../../../storage/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

const cards = {
  '0,1': ':AClub:758807093414854657',
  '0,2': ':2Club:758807092869595176',
  '0,3': ':3Club:758807092911669268',
  '0,4': ':4Club:758807092688715788',
  '0,5': ':5Club:758807092609286185',
  '0,6': ':6Club:758807094480338964',
  '0,7': ':7Club:758807093003681851',
  '0,8': ':8Club:758807093128986664',
  '0,9': ':9Club:758807093041561610',
  '0,10': ':10Club:758807092831453236',
  '0,11': ':JClub:758807093204746260',
  '0,12': ':QClub:758807255683956787',
  '0,13': ':KClub:758807093225979904',
  '1,1': ':ADiamond:758807093188493342',
  '1,2': ':2Diamond:758807092881522700',
  '1,3': ':3Diamond:758807092483194911',
  '1,4': ':4Diamond:758807092840366101',
  '1,5': ':5Diamond:758807093242232842',
  '1,6': ':6Diamond:758807092852949034',
  '1,7': ':7Diamond:758807093082980352',
  '1,8': ':8Diamond:758807093347614761',
  '1,9': ':9Diamond:758807093213528094',
  '1,10': ':10Diamond:758807093309341706',
  '1,11': ':JDiamond:758807093053620254',
  '1,12': ':QDiamond:758807255688282153',
  '1,13': ':KDiamond:758807093527707668',
  '2,1': ':AHeart:758807093372780604',
  '2,2': ':2Heart:758807092760674326',
  '2,3': ':3Heart:758807093154676756',
  '2,4': ':4Heart:758807092886372453',
  '2,5': ':5Heart:758807093015740456',
  '2,6': ':6Heart:758807093133312026',
  '2,7': ':7Heart:758807092802355214',
  '2,8': ':8Heart:758807093284962354',
  '2,9': ':9Heart:758807093200945192',
  '2,10': ':10Heart:758807092978384917',
  '2,11': ':JHeart:758807093095563314',
  '2,12': ':QHeart:758807255801266196',
  '2,13': ':KHeart:758807092928053300',
  '3,1': ':ASpade:758807092789641227',
  '3,2': ':2Spade:758807092827521046',
  '3,3': ':3Spade:758807092806025217',
  '3,4': ':4Spade:758807092898299964',
  '3,5': ':5Spade:758807093108146212',
  '3,6': ':6Spade:758807092831584329',
  '3,7': ':7Spade:758807092793835552',
  '3,8': ':8Spade:758807092706017282',
  '3,9': ':9Spade:758807093238169620',
  '3,10': ':10Spade:758807093188100116',
  '3,11': ':JSpade:758807092990705706',
  '3,12': ':QSpade:758807255734026240',
  '3,13': ':KSpade:758807093373042728',
  secret: ':RHiddenCard:758807255679238185',
};

class BlackjackCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!', ephemeral: true });

    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let bal = Member.getCoin(interaction.user.id);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    if (bal < bet) return interaction.reply(`You do not have enough coins to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductCoin(interaction.user.id, bet);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    // Start a new game
    const game = new Blackjack();
    const init = game.start();
    if (!init.dealerCards[0] || !init.dealerCards[1]) return interaction.reply('Could not deal cards! Try again.');

    let playerHand = '';
    let dealerHand: string;
    let playerCount: string;
    let dealerCount: string;
    let ended = false;
    let currentBet = bet;
    let description = `You bet ${CurrencyUtils.format(currentBet)}. You have ${CurrencyUtils.format(bal)} left.`;

    // Format player and dealer hand (1 concealed) and counts
    init.playerCards.forEach((card) => {
      playerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
    });
    dealerHand = `<${cards[`${init.dealerCards[0].suit},${init.dealerCards[0].rank}`]}><${cards.secret}>`;
    playerCount = `You | ${init.playerStartingCount}`;
    dealerCount = `Dealer | ${init.dealerStartingCount} + ?`;

    // Check if player is dealt natural
    const startingCheck = game.checkNatural();
    if (startingCheck === 'Player') {
      ended = true;
      dealerHand = '';
      init.dealerCards.forEach((card) => {
        dealerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
      });
      bal = Member.addCoin(interaction.user.id, currentBet * 2) ?? 0;
      description = `\nYou bet ${CurrencyUtils.format(currentBet)} and earned ${CurrencyUtils.format(currentBet * 2)}\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
    }
    if (startingCheck === 'Draw') {
      ended = true;
      dealerHand = '';
      init.dealerCards.forEach((card) => {
        dealerHand += `<${cards[`${card.suit},${card.rank}`]}>`;
      });
      bal = Member.addCoin(interaction.user.id, currentBet);
      description = `\nYou bet ${CurrencyUtils.format(currentBet)} and drew!\nYou now have ${CurrencyUtils.formatEmoji(bal ?? 0)}`;
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
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
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
        bal = Member.addCoin(interaction.user.id, currentBet * 2) ?? 0;
        description = `\nYou bet ${CurrencyUtils.format(currentBet)} and earned ${CurrencyUtils.format(currentBet * 2)}!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
      }
      if (data.winner === 'Dealer' || data.winner === 'PlayerBust') {
        description = `\nYou bet ${CurrencyUtils.format(currentBet)} and lost!\nYou now have ${CurrencyUtils.formatEmoji(bal ?? 0)}`;
      }
      if (data.winner === 'Draw') {
        bal = Member.addCoin(interaction.user.id, currentBet) ?? 0;
        description = `\nYou bet ${CurrencyUtils.format(currentBet)} and drew!\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
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

    return msg;
  }
}

export const builder = new SlashCommandBuilder()
  .setName('blackjack')
  .setDescription('Play a game of blackjack.')
  .addIntegerOption((option) => option
    .setName('bet')
    .setDescription('The amount of coins to bet')
    .setMinValue(1)
    .setMaxValue(50)
    .setRequired(true));

export default new BlackjackCommand();
