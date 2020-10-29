import Twit from 'twit';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import { DolarResponseI, DolarTwitI } from "./dolar.model";
dotenv.config();

const Twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY!,
  consumer_secret: process.env.CONSUMER_SECRET!,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

(function main(): void {
  postTweets();
}());

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
}

async function getDolar(): Promise<Array<DolarTwitI> | void> {
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

function postTweets() {
  const DOLAR_RULE = getScheduleRule(
    {
      days: [new schedule.Range(1, 5)],
      hours: [10, 15, 22],
      minute: 30
    });

  schedule.scheduleJob(DOLAR_RULE!, async function () {
    const DOLAR_ARRAY = await getDolar();
    if (!DOLAR_ARRAY) return;

    DOLAR_ARRAY.forEach(dolar => {
      const DOLAR_LABEL = getRandomText(dolar.dolarType, dolar.dolarValue);
      postToTwitter(DOLAR_LABEL, dolar.dolarValue);
    });
  });
}

function postToTwitter(dolarLabel: string, dolarPrice: number) {
  Twitter.post('statuses/update', { status: dolarLabel }, function () {
    console.log(`Twitted dolar blue on $${dolarPrice} ${getNow()}`);
  });
}

function getScheduleRule(
  { day,
    days,
    hour,
    hours,
    minute
  }: {
    day?: number;
    days?: [schedule.Range];
    hour?: number;
    hours?: Array<number>;
    minute: number;
  }): schedule.RecurrenceRule | null {
  const rule = new schedule.RecurrenceRule();
  if (day && days === undefined) return null;
  if (hour && hours === undefined) return null;
  rule.dayOfWeek = day! || days!;
  rule.hour = hour! || hours!;
  rule.minute = minute;
  return rule;
}

function getRandomText(dolarType: string, dolarPrice: number): string {
  const DOLAR_LABEL = [
    'Un dolar ' + dolarType + ' en este momento son $' + dolarPrice + ' ARS',
    'Hoy, un dolar ' + dolarType + ' está $' + dolarPrice + ' ARS',
    'En este momento, el dolar ' + dolarType + ' está a $' + dolarPrice + ' ARS',
    'El dolar ' + dolarType + ' se encuentra a $' + dolarPrice + ' ARS',
    'Un dolar ' + dolarType + ' cuesta $' + dolarPrice + ' ARS',
    'Ahora, un dolar ' + dolarType + ' vale $' + dolarPrice + ' ARS',
    'Al dia de hoy un dolar ' + dolarType + ' está a $' + dolarPrice + ' ARS',
    'Un dolar ' + dolarType + ' al día de hoy equivale a $' + dolarPrice + ' ARS',
    'Un dolar ' + dolarType + ' está a $' + dolarPrice + ' ARS',
    'Hoy el dolar ' + dolarType + ' está a $' + dolarPrice + ' ARS',
    'Un dolar ' + dolarType + ', $' + dolarPrice + ' ARS',
    'Actualmente un dolar ' + dolarType + ' está a $' + dolarPrice + ' ARS',
    'Actualmente, un dolar ' + dolarType + ' equivale a $' + dolarPrice + ' ARS',
    'En el dia de hoy, un dolar ' + dolarType + ' vale $' + dolarPrice + ' ARS',
    'El dolar ' + dolarType + ' equivale $' + dolarPrice + ' ARS',
  ];
  return DOLAR_LABEL[Math.floor(Math.random() * DOLAR_LABEL.length)];
};

function getNow(): string {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return date + ' ' + time;
};