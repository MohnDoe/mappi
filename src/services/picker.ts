import type {
  ExtendedBooster,
  ExtendedCard,
  ExtendedSet,
} from "@/models/taw.types";
import { weighted } from "@lrkit/weighted";

export class Picker {
  _seed: string;
  _set: ExtendedSet;

  booster: ExtendedBooster["sheets"] | null = null;

  constructor(set: ExtendedSet, seed?: string) {
    this._set = set;
    this._seed = seed || Picker.generateSeed();
  }

  static generateSeed(): string {
    return crypto.randomUUID();
  }

  pickBooster() {
    this.booster = weighted(
      this._set.boosters.map((booster) => ({
        weight: booster.weight,
        item: booster.sheets,
      })),
      {
        seed: this._seed,
      },
    ).pick();
  }

  pickCards() {
    const cardsPerSheet: Record<string, ExtendedCard[]> = {};
    let cards: ExtendedCard[] = [];

    if (!this.booster) this.pickBooster();

    for (const sheetName of Object.keys(this.booster!)) {
      const weightedCards = weighted(
        this._set.sheets[sheetName]!.cards.map((card) => ({
          weight: card.weight,
          item: card,
        })),
        { seed: this._seed },
      );

      const selectedCards = weightedCards.pick({
        quantity: this.booster![sheetName]!,
      }) as ExtendedCard[];
      cardsPerSheet[sheetName] = selectedCards;
      cards = [...cards, ...selectedCards];
    }

    return {
      cardsPerSheet,
      cards,
    };
  }
}
