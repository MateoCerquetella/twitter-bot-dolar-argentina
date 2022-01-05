import { api } from './helpers/helpers';
import { DolarResponse, DolarType } from './model/dolar.model';

export class Dolar {
  constructor() {}

  private async getApiDolar(): Promise<DolarResponse[]> {
    try {
      const URL = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales';
      return await api<DolarResponse[]>(URL).then((res) => res);
    } catch (error) {
      console.log(error);
      throw new Error('Error retrieving dolar');
    }
  }

  private getDolarType(
    res: DolarResponse[],
    dolarType: DolarType
  ): DolarResponse[] {
    return res.filter(
      (dolar) => dolar.casa.nombre?.toLowerCase() === dolarType
    );
  }

  public async retrieveDolar() {
    const dolarArray = await this.getApiDolar();
    const dolarBlue = this.getDolarType(dolarArray, DolarType.blue);
    const dolarTurista = this.getDolarType(dolarArray, DolarType.turista);
    const dolarBolsa = this.getDolarType(dolarArray, DolarType.bolsa);
    return [...dolarBlue, ...dolarTurista, ...dolarBolsa];
  }
}
export const dolar = new Dolar();
