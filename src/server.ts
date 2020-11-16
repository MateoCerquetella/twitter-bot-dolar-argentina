import Twit from 'twit';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import process from 'process';
import { DolarResponseI, DolarTwitI } from "./model/dolar.model";
import { Status, User, UserFollow, Welcome } from './model/twit.extend';
import { api, getNow, getRandomText, getScheduleRule } from './helpers/helpers';
dotenv.config();

const Twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY!,
  consumer_secret: process.env.CONSUMER_SECRET!,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

(function main(): void {
  process.title = 'node-twitter-bot';
  console.log(`Started ${process.title} with PID ${process.pid}`);
  schedulerJob();
}());

async function schedulerJob(): Promise<void> {
  const DOLAR_RULE = getScheduleRule({
    days: [new schedule.Range(1, 5)],
    hours: [10, 14, 19],
    minute: 30
  });

  schedule.scheduleJob(DOLAR_RULE!, async function getDolarAndPost(): Promise<void> {
    const DOLAR_ARRAY = await getApiDolar();
    if (!DOLAR_ARRAY) return;

    // Twit dolar
    DOLAR_ARRAY.forEach(dolar => {
      const DOLAR_LABEL = getRandomText(dolar.dolarType, dolar.dolarValue);
      postToTwitter(DOLAR_LABEL, dolar.dolarType, dolar.dolarValue);
    });

    // Follow users
    getUsersIdBySearch();
  });
}

async function getApiDolar(): Promise<Array<DolarTwitI> | null> {
  try {
    const URL = 'https://api.bluelytics.com.ar/v2/latest';
    const res = await api<DolarResponseI>(URL);
    return [{
      dolarType: 'blue',
      dolarValue: Math.ceil(res.blue.value_sell)
    },
    {
      dolarType: 'solidario',
      dolarValue: +(res.oficial.value_sell * 1.65).toFixed(2)
    }];
  } catch (error) {
    console.log(error);
    return null;
  }
}

function postToTwitter(dolarLabel: string, dolarType: string, dolarPrice: number): void {
  Twitter.post('statuses/update', { status: dolarLabel }, function () {
    console.log(`Twitted dolar ${dolarType}
                price: $${dolarPrice}
                date: ${getNow()}`);
  });
}

function getUsersIdBySearch(): void {
  const BUENOS_AIRES_GEO = '-34.603722,-58.381592,1000km';
  const QUERY = 'dolar';
  const MAX_TWEETS = 100;

  Twitter.get('search/tweets', { q: QUERY, geocode: BUENOS_AIRES_GEO, count: MAX_TWEETS }, function (err, data: object, res) {
    if (!data || err) return;

    const TWITTER_DATA: Welcome = data as Welcome; // Cast Object to Welcome
    const TWITTER_STATUS: Status[] = TWITTER_DATA.statuses; // Cast Welcome.statuses to Status[] model
    let userFollowers: UserFollow[] | null = null;

    userFollowers = TWITTER_STATUS.map(twit => {
      const user = twit.user as unknown as User;
      const userFollow: UserFollow = {
        id_str: user.id_str.toString(),
        screen_name: user.screen_name
      };
      return userFollow;
    });

    followUsers(userFollowers);
  });

  function followUsers(userFollowers: UserFollow[] | null): void {
    userFollowers?.forEach(user => {
      Twitter.post('friendships/create', { id: user.id_str }, function (err, result, response) {
        if (err) {
          console.log(err);
          return;
        };
        (result) ? console.log(`Seguido a ${user.screen_name}`) : null;
      });
    });
  }
}