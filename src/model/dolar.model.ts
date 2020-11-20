export type DolarResponse = {
  oficial: Dolar;
  blue: Dolar;
  oficial_euro: Dolar;
  blue_euro: Dolar;
  last_update: Date;
};

export type Dolar = {
  value_avg: number;
  value_sell: number;
  value_buy: number;
};

export type DolarTwit = {
  dolarType: string;
  dolarValue: number;
};

export enum DolarType {
  oficial = 'oficial',
  blue = 'blue',
  solidario = 'solidario',
}
