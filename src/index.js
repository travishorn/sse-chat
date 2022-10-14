import { randomUUID } from "node:crypto";
import express from "express";
import bodyParser from "body-parser";

const app = express();

const clients = [];

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("home", { message: "hi" });
});

app.get("/events", (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  const client = {
    id: randomUUID(),
    res,
  };

  console.log("Client joined", client.id);
  clients.push(client);

  req.on("close", () => {
    const index = clients.findIndex((c) => c.id = client.id);
    console.log("Client left  ", client.id);
    clients.splice(index, 1);
  });
});

app.post("/message", (req, res) => {
  const message = {
    username: req.body.username,
    message: req.body.message,
  };

  console.log("Recieved message", message);

  clients.forEach((c) => {
    c.res.write(`data: ${JSON.stringify(message)}\n\n`);
  });

  res.end();
});

app.listen(3000, () => {
  console.log(`sse-chat server listening at http://127.0.0.1:3000`);
});
