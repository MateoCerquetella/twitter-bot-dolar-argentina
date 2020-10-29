export type DolarResponseI = {
  oficial: Object;
  blue: DolarBlueI;
  oficial_euro: Object;
  blue_euro: Object;
  last_update: Date;
};

export type DolarBlueI = {
  value_avg: number;
  value_sell: number;
  value_buy: number;
};
