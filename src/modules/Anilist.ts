import { CronJob } from 'cron';
import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js';
import day from 'dayjs';
import fetch from 'node-fetch';
import Anilist from '../storage/models/Anilist';

const airingScheduleQuery = `
  query ($mediaId: Int) {
    AiringSchedule (mediaId: $mediaId, notYetAired: true) {
      airingAt
      episode
      media {
        title {
          english
        }
      }
      mediaId
    }
  }
`;

interface AiringSchedule {
  errors: unknown, // Used as a boolean only.
  data: {
    AiringSchedule: {
      airingAt: number,
      episode: number,
      media: {
        title: {
          english: string
        }
      },
      mediaId: number
    }
  }
}

class AniListAPI {
  bot: Client;

  channelId: string;

  roleId: string;

  public constructor(bot: Client, channelId: string, roleId: string) {
    this.bot = bot;
    this.channelId = channelId;
    this.roleId = roleId;
  }

  // eslint-disable-next-line class-methods-use-this
  public getFromDb(): number[] {
    return Anilist.getAll();
  }

  // eslint-disable-next-line class-methods-use-this
  public addToDB(mediaId: number) {
    Anilist.add(mediaId);
  }

  // eslint-disable-next-line class-methods-use-this
  public removeFromDb(mediaId: number) {
    Anilist.remove(mediaId);
  }

  // eslint-disable-next-line class-methods-use-this
  public async fetchMediaAiring(mediaId: number):
  Promise<{ schedule: AiringSchedule, mediaId: number }> {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: airingScheduleQuery,
        variables: { mediaId },
      }),
    });

    const schedule = (await response.json()) as AiringSchedule;
    return { schedule, mediaId };
  }

  public getDailySchedule() {
    const mediaIds = this.getFromDb();
    return Promise.all(mediaIds.map((mediaId: number) => this.fetchMediaAiring(mediaId)));
  }

  public startDailyPost(): void {
    // TODO: optionally add kasumi icon to footer?
    const embed = new EmbedBuilder({
      title: `🌸 The Daily Anime News [${day().format('MM/DD/YYYY')}] 🌸`,
      description: `
        ༉‧₊˚. こんにちは <@&${this.roleId}> readers!
        ༉‧₊˚. We're back to bring you the **latest and greatest anime airing for today**.
        ༉‧₊˚. They're **handpicked by our staff** so we hope that you'll enjoy watching them!
      `,
      image: {
        url: '', // TODO: Map day to image link when he is ready.
      },
      footer: {
        text: '｡･:˚✧｡ Thanks for reading! :: We\'ll see you tomorrow! ｡･˚:✧｡',
      },
    });

    const field = {
      name: '˚ ༘♡ ⋆｡˚🏮 Anime Spotlight 🏮˚ ༘♡ ⋆｡˚',
      value: '',
    };

    // eslint-disable-next-line
    new CronJob('00 00 00 * * *', async () => {
      (await this.getDailySchedule())
        .forEach((anime: { schedule: AiringSchedule, mediaId: number }) => {
          const airingSchedule = anime.schedule.data.AiringSchedule;
          if (anime.schedule.errors) {
            this.removeFromDb(anime.mediaId);
          } else if (airingSchedule.airingAt
            - Math.floor(new Date().getTime() / 1000) < 24 * 60 * 60) {
            const title = airingSchedule.media.title.english;
            const url = `https://anilist.co/anime/${airingSchedule.mediaId}`;
            field.value += `♡ \\♦️️ Episode ${airingSchedule.episode} - [${title}](${url})\n`;
          }
        });

      if (field.value === '') {
        field.value = 'Nothing yet!';
      }

      embed.setFields([field]);
      (this.bot.channels.cache.get(this.channelId) as TextBasedChannel).send({
        content: `<@&${this.roleId}>`, embeds: [embed],
      }).then(() => {
        field.value = '';
        embed.setTitle(`🌸 The Daily Anime News [${day().add(1, 'day').format('MM/DD/YYYY')}] 🌸`);
      });
    }, null, true, 'EST');
  }
}

export default AniListAPI;
