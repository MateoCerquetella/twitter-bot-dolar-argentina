import { getRandomText, getScheduleRule } from './helpers/helpers';

import { ScheduleRule } from './model/schedule.model';
import { dolar } from './dolar';
import { follow } from './follow';
import schedule from 'node-schedule';
import { twitter } from './twitter';

class Server {
  scheduleTwit: ScheduleRule = {
    days: [new schedule.Range(1, 5)],
    hours: [11, 15, 19],
    minute: 0
  };

  public main(): void {
    process.title = 'node-twitter-bot';
    console.log(`Started ${process.title} with PID ${process.pid}`);
    this.schedulerJob();
  }

  private async schedulerJob(): Promise<void> {
    const DOLAR_RULE = getScheduleRule(this.scheduleTwit);
    schedule.scheduleJob(DOLAR_RULE, this.getDolarAndPost);
  }

  private async getDolarAndPost(): Promise<void> {
    const DOLAR_ARRAY = await dolar.getApiDolar();
    if (!DOLAR_ARRAY) return;

    // Twit dolar
    DOLAR_ARRAY.forEach((dolar) => {
      const DOLAR_LABEL = getRandomText(dolar.dolarType, dolar.dolarValue);
      twitter.postToTwitter(DOLAR_LABEL, dolar.dolarType, dolar.dolarValue);
    });

    // Follow users
    follow.followUsers();
  }
}

const server = new Server();
server.main();
