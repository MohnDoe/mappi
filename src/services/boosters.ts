import sealedData from "@/data/sealedExtendedData";
import type { SealedExtendedData } from "@/models/taw.types";

export const listBoosters = () => {
  return sealedData as SealedExtendedData;
};

export const getSet = (code: string) => {
  return listBoosters().find((booster) => booster.code === code);
};
