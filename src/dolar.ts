import { api } from './helpers/helpers';
import { DolarResponse, DolarTwit, DolarType } from './model/dolar.model';

export class Dolar {
  constructor() {}

  public async getApiDolar(): Promise<Array<DolarTwit> | null> {
    try {
      const URL = 'https://api.bluelytics.com.ar/v2/latest';
      // TODO: Use this https://www.dolarsi.com/api/api.php?type=valoresprincipales
      const res = await api<DolarResponse>(URL);
      return [
        {
          dolarType: DolarType.blue,
          dolarValue: Math.ceil(res.blue.value_sell)
        },
        {
          dolarType: DolarType.solidario,
          dolarValue: +(res.oficial.value_sell * 1.65).toFixed(2)
        }
      ];
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
export const dolar = new Dolar();
