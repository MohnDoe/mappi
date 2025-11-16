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

export default app;
