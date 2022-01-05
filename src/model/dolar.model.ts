export interface DolarResponse {
  casa: Dolar;
}

export interface Dolar {
  compra: string;
  venta: string;
  agencia: string;
  nombre: string;
  variacion: string;
  ventaCero: string;
  decimales: string;
}

export type DolarTwit = {
  dolarType: string;
  dolarValue: number;
};

export enum DolarType {
  blue = 'dolar blue',
  turista = 'dolar turista',
  bolsa = 'dolar bolsa'
}
