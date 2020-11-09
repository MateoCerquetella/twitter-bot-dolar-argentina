import schedule from 'node-schedule';
import fetch from 'node-fetch';

export async function api<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
}

export function getNow(): string {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  return date + ' ' + time;
};

export function getScheduleRule(
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

export function getRandomText(dolarType: string, dolarPrice: number): string {
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
