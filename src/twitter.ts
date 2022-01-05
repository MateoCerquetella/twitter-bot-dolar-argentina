import dotenv from 'dotenv';
import Twit from 'twit';

import { getNow } from './helpers/helpers';

dotenv.config();

class Twitter {
  Twit: Twit;

  constructor(
    consumer_key: string,
    consumer_secret: string,
    access_token: string,
    access_token_secret: string
  ) {
    this.Twit = new Twit({
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      access_token: access_token,
      access_token_secret: access_token_secret
    });
  }

  public postToTwitter(
    dolarLabel: string,
    dolarType: string,
    dolarPrice: string
  ): void {
    this.Twit.post('statuses/update', { status: dolarLabel }, function () {
      console.log(`Twitted ${dolarType}
              price: $${dolarPrice}
              date: ${getNow()}`);
    });
  }
}

export const twitter = new Twitter(
  process.env.CONSUMER_KEY!,
  process.env.CONSUMER_SECRET!,
  process.env.ACCESS_TOKEN!,
  process.env.ACCESS_TOKEN_SECRET!
);
