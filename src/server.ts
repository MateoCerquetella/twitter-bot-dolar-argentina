import Twit from 'twit';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import process from 'process';
import { DolarResponseI, DolarTwitI } from "./dolar.model";
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

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
}

async function getApiDolar(): Promise<Array<DolarTwitI> | void> {
  try {
    const res = await api<DolarResponseI>('https://api.bluelytics.com.ar/v2/latest');
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
  }
}

async function schedulerJob(): Promise<void> {
  const DOLAR_RULE = getScheduleRule(
    {
      days: [new schedule.Range(1, 5)],
      hours: [10, 14, 19],
      minute: 49
    });

  schedule.scheduleJob(DOLAR_RULE!, async function getDolarAndPost(): Promise<void> {
    const DOLAR_ARRAY = await getApiDolar();
    if (!DOLAR_ARRAY) return;

    DOLAR_ARRAY.forEach(dolar => {
      const DOLAR_LABEL = getRandomText(dolar.dolarType, dolar.dolarValue);
      postToTwitter(DOLAR_LABEL, dolar.dolarType, dolar.dolarValue);
    });
  });
}

function postToTwitter(dolarLabel: string, dolarType: string, dolarPrice: number): void {
  Twitter.post('statuses/update', { status: dolarLabel }, function () {
    console.log(`Twitted dolar ${dolarType}
                price: $${dolarPrice}
                date: ${getNow()}`);
  });
}

function getScheduleRule(
  { days,
    hours,
    minute
  }: {
    days?: [schedule.Range];
    hours?: Array<number>;
    minute: number;
  }): schedule.RecurrenceRule | null {
  const rule = new schedule.RecurrenceRule();
  if (days === undefined) return null;
  if (hours === undefined) return null;
  rule.dayOfWeek = days;
  rule.hour = hours;
  rule.minute = minute;
  return rule;
}

function getRandomText(dolarType: string, dolarPrice: number): string {
  const DOLAR_LABEL = [
    `Un dolar ${dolarType} en este momento son $${dolarPrice} pesos argentinos`,
    `Hoy, un dolar ${dolarType} está $${dolarPrice} pesos argentinos`,
    `En este momento, el dolar ${dolarType} está a $${dolarPrice} pesos argentinos`,
    `El dolar ${dolarType} se encuentra a $${dolarPrice} pesos argentinos`,
    `Un dolar ${dolarType} cuesta $${dolarPrice} pesos argentinos`,
    `Ahora, un dolar ${dolarType} vale $${dolarPrice} pesos argentinos`,
    `Al dia de hoy un dolar ${dolarType} está a $${dolarPrice} pesos argentinos`,
    `Un dolar ${dolarType} al día de hoy equivale a $${dolarPrice} pesos argentinos`,
    `Un dolar ${dolarType} está a $${dolarPrice} pesos argentinos`,
    `Hoy el dolar ${dolarType} está a $${dolarPrice} pesos argentinos`,
    `Un dolar ${dolarType}, $${dolarPrice} pesos argentinos`,
    `Actualmente un dolar ${dolarType} está a $${dolarPrice} pesos argentinos`,
    `Actualmente, un dolar ${dolarType} equivale a $${dolarPrice} pesos argentinos`,
    `En el dia de hoy, un dolar ${dolarType} vale $${dolarPrice} pesos argentinos`,
    `El dolar ${dolarType} equivale $${dolarPrice} pesos argentinos`,
  ];
  return DOLAR_LABEL[Math.floor(Math.random() * DOLAR_LABEL.length)];
};

function getNow(): string {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return date + ' ' + time;
};