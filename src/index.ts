import { Hono } from "hono";
import { timing } from "hono/timing";
import boosters from "@/routes/boosters";

const app = new Hono();

app.use(timing());

app.get("/", (c) => {
  return c.json({
    ok: true,
    message: "Hello World",
  });
});

app.route("/boosters", boosters);

export default app;
