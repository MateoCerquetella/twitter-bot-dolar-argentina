export type DolarResponseI = {
  oficial: DolarI;
  blue: DolarI;
  oficial_euro: DolarI;
  blue_euro: DolarI;
  last_update: Date;
};

export type DolarI = {
  value_avg: number;
  value_sell: number;
  value_buy: number;
};

export type DolarTwitI = {
  dolarType: string;
  dolarValue: number;
};

export enum DolarType {
  oficial = 'oficial',
  blue = 'blue',
  solidario = 'solidario'
}