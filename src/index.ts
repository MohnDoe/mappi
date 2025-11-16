import { Hono } from "hono";
import { timing } from "hono/timing";
import sets from "@/routes/sets";

const app = new Hono();

app.use(timing());

app.get("/", (c) => {
  return c.json({
    ok: true,
    message: "Hello World",
  });
});

app.route("/sets", sets);

export default app;
