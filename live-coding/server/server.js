import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import db from './inMemoryDatabase.js';
import polling from './polling.js';

const JWT_SECRET = 'jsonbwebtokensareawesomebutparrotsdogscatsdolphinesareawesometoo';
const app = express();

app.use(cors());
app.use(express.json());

/** Verify presence bearer token and verify the signature of said token
 * Attaches username to response.locals if signature passes
 * 
 * Results in malformed (400) if the token is missing or incorrectly passed in the http header
 * Results in unauthorized (403) if token fails signature verification
 */
const jwtFilter = (request, response, next) => {
  const authHeader = request.headers["authorization"];

  if (authHeader == undefined || !authHeader.includes("Bearer ")) {
    return response.sendStatus(400);
  }

  // send unauthorized error if jwt fails verification
  try {
    const token = authHeader.replace("Bearer " , "");
    const payload = jwt.verify(token, JWT_SECRET);

    response.locals.username = payload.username;

    next();
  } catch {
    return response.sendStatus(403);
  }
}

/**
 * Fetches all data from authenticated user
 * 
 * returns a list of all items
 */
app.get("/shopping/cart/", jwtFilter, (request, response) => {
  const username = response.locals.username;

  db.getItems(username).then(data => response.send(data));
})

app.get("/subscribe/cart/", jwtFilter, (request, response) => {
  const username = response.locals.username;

  const timeoutId = setTimeout(() => { // stäng ner efter en bestämd tid för att undvika en memory leak
    polling.unsubscribe(username, "post-cart");
    response.sendStatus(204);
  }, 20000) // 20 s

  polling.subscribe(username, "post-cart", data => {
    clearTimeout(timeoutId);
    response.send(data);
  });
})

/**
 * Inserts data from authenticated user
 * 
 * returns a list of all items
 */
app.post("/shopping/cart/", jwtFilter, (request, response) => {
  const item = request.body.item;
  const username = response.locals.username;

  // när en item har lagts till, säg åt long polling att en uppdatering har hänt
  db.saveItem(username, item).then(data => {
    response.send(data);
    polling.fireEvent(username, "post-cart", data);
  });
})


app.post("/auth/login/", (request, response) => {
  const username = request.body.username;

  if(username == undefined) {
    return response.sendStatus(400);
  }

  const accessToken = jwt.sign({username}, JWT_SECRET);

  response.status(201);
  response.send({accessToken});
})

app.listen(3000, () => console.log("Server started on port 3000"));