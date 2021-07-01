import { Status, User, UserFollow, Welcome } from './model/twit.extend';

import { print } from './helpers/helpers';
import { twitter } from './twitter';

export class Follow {
  OK_FOLLOW = 0;
  ERROR_FOLLOW = 0;
  MAX_TWEETS = 100;
  BUENOS_AIRES_GEO = '-34.603722,-58.381592,1000km';
  QUERY = 'dolar';

  constructor() {}

  public followUsers(): void {
    twitter.Twit.get(
      'search/tweets',
      { q: this.QUERY, geocode: this.BUENOS_AIRES_GEO, count: this.MAX_TWEETS },
      this.fetchTweets
    );
  }

  private fetchTweets(err: any, result: object, _: any): void {
    if (!result || err) {
      console.log(`Unable to fetch tweets, error: ${err}`);
      return;
    }
    this.castAndFollowUser(result);
  }

  private castAndFollowUser(result: object): void {
    const TWITTER_DATA: Welcome = result as Welcome; // Cast Object to Welcome
    const TWITTER_STATUS: Status[] = TWITTER_DATA.statuses; // Cast Welcome.statuses to Status[] model

    TWITTER_STATUS.forEach(async (twit: { user: unknown }) => {
      const user = twit.user as unknown as User;
      const userFollow: UserFollow = {
        id_str: user.id_str.toString(),
        screen_name: user.screen_name
      };
      await this.followUser(userFollow);
    });
  }

  private async followUser(user: UserFollow): Promise<void> {
    twitter.Twit.post(
      'friendships/create',
      { id: user.id_str },
      this.statusFollow
    );
  }

  private statusFollow(err: any, _: any, __: any): void {
    err ? this.ERROR_FOLLOW++ : this.OK_FOLLOW++;
    print(
      `Successfuly followed: ${this.OK_FOLLOW} - Unable to follow: ${this.ERROR_FOLLOW}`
    );
  }
}
export const follow = new Follow();
