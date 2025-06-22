import api from "@/utils/api";
import { TreasureMapFormData, TreasureMapResponse } from "@/types/treasureMap";

export async function createTreasureMap(data: TreasureMapFormData): Promise<TreasureMapResponse> {
  const res = await api.post("TreasureMap", {
    rowCount: data.rowCount,
    colCount: data.colCount,
    p: data.p,
    matrixJson: JSON.stringify(data.matrix),
  });
  return res.data;
}
