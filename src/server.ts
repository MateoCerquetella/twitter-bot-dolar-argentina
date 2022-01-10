import schedule from 'node-schedule';

import { dolar } from './dolar';
import { getScheduleRule } from './helpers/helpers';
import { ScheduleRule } from './model/schedule.model';
import { twitter } from './twitter';

class Server {
  scheduleTwit: ScheduleRule = {
    days: [new schedule.Range(1, 5)],
    hours: [11, 18],
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
    const DOLAR_ARRAY = await dolar.retrieveDolar();
    if (!DOLAR_ARRAY) return;

    // Twit Dolar
    DOLAR_ARRAY.forEach((dolar) => {
      const { nombre, venta } = dolar.casa;
      const DOLAR_TYPE = nombre.toLowerCase();
      const DOLAR_VENTA = parseFloat(venta).toFixed(2).replace('.', ',');

      twitter.postToTwitter(
        `Un ${DOLAR_TYPE} está $${DOLAR_VENTA} pesos argentinos`,
        DOLAR_TYPE,
        venta
      );
    });

    // Follow users
    // follow.followUsers();
  }
}

const server = new Server();
server.main();
