import Twit from 'twit';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import process from 'process';
import { DolarResponse, DolarTwit, DolarType } from './model/dolar.model';
import { Status, User, UserFollow, Welcome } from './model/twit.extend';
import {
  api,
  getNow,
  getRandomText,
  getScheduleRule,
  percentage,
  print,
} from './helpers/helpers';
import { TwitterError } from './model/error.model';
import { ScheduleRule } from './model/schedule.model';
dotenv.config();

// Global Variables
const Twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY!,
  consumer_secret: process.env.CONSUMER_SECRET!,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const scheduleTwit: ScheduleRule = {
  days: [new schedule.Range(1, 5)],
  hours: [10, 14, 19],
  minute: 30,
};

// Counters
let okFollow = 0;
let errorFollow = 0;

(function main(): void {
  process.title = 'node-twitter-bot';
  console.log(`Started ${process.title} with PID ${process.pid}`);
  schedulerJob();
})();

async function schedulerJob(): Promise<void> {
  const DOLAR_RULE = getScheduleRule(scheduleTwit);

  schedule.scheduleJob(
    DOLAR_RULE,
    async function getDolarAndPost(): Promise<void> {
      const DOLAR_ARRAY = await getApiDolar();
      if (!DOLAR_ARRAY) return;

      // Twit dolar
      DOLAR_ARRAY.forEach((dolar) => {
        const DOLAR_LABEL = getRandomText(dolar.dolarType, dolar.dolarValue);
        postToTwitter(DOLAR_LABEL, dolar.dolarType, dolar.dolarValue);
      });

      // Follow users
      getUsersIdBySearch();
    }
  );
}

async function getApiDolar(): Promise<Array<DolarTwit> | null> {
  try {
    const URL = 'https://api.bluelytics.com.ar/v2/latest';
    const res = await api<DolarResponse>(URL);
    return [
      {
        dolarType: DolarType.blue,
        dolarValue: Math.ceil(res.blue.value_sell),
      },
      {
        dolarType: DolarType.solidario,
        dolarValue: +(res.oficial.value_sell * 1.65).toFixed(2),
      },
    ];
  } catch (error) {
    console.log(error);
    return null;
  }
}

function postToTwitter(
  dolarLabel: string,
  dolarType: string,
  dolarPrice: number
): void {
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

  Twitter.get(
    'search/tweets',
    { q: QUERY, geocode: BUENOS_AIRES_GEO, count: MAX_TWEETS },
    function (err, result: object, response) {
      if (!result || err) {
        console.log(`Unable to fetch tweets, error: ${err}`);
        return;
      }
      castAndFollowUser(result, MAX_TWEETS);
    }
  );
}

function castAndFollowUser(result: object, MAX_TWEETS: number): void {
  const TWITTER_DATA: Welcome = result as Welcome; // Cast Object to Welcome
  const TWITTER_STATUS: Status[] = TWITTER_DATA.statuses; // Cast Welcome.statuses to Status[] model

  TWITTER_STATUS.forEach(async (twit) => {
    const user = (twit.user as unknown) as User;
    const userFollow: UserFollow = {
      id_str: user.id_str.toString(),
      screen_name: user.screen_name,
    };
    await followUser(userFollow, MAX_TWEETS);
  });
}

async function followUser(user: UserFollow, MAX_TWEETS: number): Promise<void> {
  Twitter.post(
    'friendships/create',
    { id: user.id_str },
    function (err, result, response) {
      err ? errorFollow++ : okFollow++;
      print(
        `Successful follow: ${okFollow} Unable to follow: ${errorFollow} Percentage: ${percentage(
          okFollow,
          errorFollow,
          MAX_TWEETS
        )}%`
      );
    }
  );
}
