import { Hono } from "hono";
import { getSet, listBoosters } from "@/services/boosters";
import { Picker } from "@/services/picker";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    boosters: listBoosters(),
  });
});

app.get("/:code/open", (c) => {
  const { code } = c.req.param();
  const set = getSet(code);
  if (!set) {
    return c.json({
      error: "Set not found",
    });
  }

  const picker = new Picker(set);

  picker.pickBooster();

  const { cardsPerSheet, cards } = picker.pickCards();

  return c.json({
    set,
    selectedBooster: picker.booster,
    cardsPerSheet,
    cards,
    seed: picker._seed,
    date: new Date(),
  });
});

app.get("/:code/rates", (c) => {
  const { code } = c.req.param();
  const set = getSet(code);

  if (!set) return c.json({ message: "No set" });

  let boosters = [];
  const totalBoostersWeight = set.boosters.reduce(
    (total, booster) => total + booster.weight,
    0,
  );

  for (const booster of set.boosters) {
    const boosterRate = booster.weight / totalBoostersWeight;
    let boosterSheets = [];

    for (const sheetName in booster.sheets) {
      let sheetRates = {
        name: sheetName,
        nCardsToPick: booster.sheets[sheetName],
        cards: [],
      } as { name: string; nCardsToPick: number; cards: any[] };
      const sheet = set.sheets[sheetName]!;
      const totalCardsWeight = sheet.cards.reduce(
        (total, card) => total + card.weight,
        0,
      );
      for (const card of sheet.cards) {
        const cardRate = card.weight / totalCardsWeight;
        sheetRates.cards = [
          ...sheetRates.cards,
          {
            ...card,
            rate: cardRate,
          },
        ];
      }

      sheetRates.cards = sheetRates.cards.sort((a, b) => b.rate - a.rate);

      boosterSheets.push(sheetRates);
    }

    boosters.push({
      sheetsRates: boosterSheets,
      rate: boosterRate,
    });
  }

  return c.json({
    boosters: boosters.sort((a, b) => b.rate - a.rate),
  });
});

export default app;
