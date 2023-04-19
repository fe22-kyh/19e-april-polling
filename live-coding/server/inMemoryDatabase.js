/**
 * Simulates a real database by using in memory storage
 * Applies a virtually simulated traffic noise
 * 
 * Memory resets upon server restart
 */
import crypto from 'crypto';
const db = {};

/* simulate traffic noise 0-7s */
const createRandomNoise = () => {
  const noise = Math.random() * 4000;
  return new Promise(resolve => setTimeout(resolve, noise));
}

/* fetch a username indexed database for any username */
const getPersonal = (username) => {
  if (!(username in db)) { // (om index:et username finns i objektet db)
    db[username] = { items: {version: 0, content: []} };
  }

  return db[username];
}

/** Save string based item with simulated production traffic
 * 
 * Returns a list with the new item added 
 * */
const saveItem = async (username, item) => {
  const userDb = getPersonal(username);
  await createRandomNoise();

  userDb.items.content.push(item);
  userDb.items.version = crypto.randomUUID();

  return userDb.items;
}

/** Fetches items content in user database
 * 
 * returns a list of all items in the users database
 */
const getItems = async(username) => {
  const userDb = getPersonal(username);
  await createRandomNoise();

  return userDb.items;
}

export default { saveItem, getItems };