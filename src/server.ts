import Twit from 'twit';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
// import schedule from 'node-schedule';
import { DolarResponseI } from "./dolar.model";
dotenv.config();

const Twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY!,
  consumer_secret: process.env.CONSUMER_SECRET!,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

(async function main(): Promise<void> {
  const DOLAR_BLUE_PRICE = await getDolar();
  if (!DOLAR_BLUE_PRICE) return;
  const DOLAR = getRandomText('blue', DOLAR_BLUE_PRICE);
  Twitter.post('statuses/update', { status: DOLAR }, function () {
    console.log(`Twitted dolar blue on $${DOLAR_BLUE_PRICE} ${getNow()}`);
  });
}());

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
}

async function getDolar(): Promise<number | void> {
  try {
    const res = await api<DolarResponseI>('https://api.bluelytics.com.ar/v2/latest');
    return Math.ceil(res.blue.value_avg);
  } catch (error) {
    console.log(error);
  }
}

// function getSchedule(
//   day: number,
//   days: [schedule.Range],
//   hour: number,
//   minute: number) {
//   const rule = new schedule.RecurrenceRule();
//   rule.dayOfWeek = day || days;
//   rule.hour = hour;
//   rule.minute = minute;

//   // const rule = new schedule.RecurrenceRule();
//   // rule.dayOfWeek = [new schedule.Range(1, 5)];
//   // rule.hour = [9, 15, 22];
//   // rule.minute = 0;

//   // //Regla de twiteo de la imagen
//   // var rule2 = new schedule.RecurrenceRule();
//   // rule2.dayOfWeek = 5; //Viernes
//   // rule2.hour = 22;
//   // rule2.minute = 1;

//   // Initialise:
//   // schedule.scheduleJob(rule, twit);
//   // schedule.scheduleJob(rule2, twitImage);}
// }

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