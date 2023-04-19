const subscriptions = {};

const subscribe = (username, eventName, onEvent) => {
  if(!(username in subscriptions)) {
    subscriptions[username] = {}
  }

  if(!(eventName in subscriptions)) {
    subscriptions[username][eventName] = [];
  }

  subscriptions[username][eventName].push(onEvent);
}

const unsubscribe = (username, eventName) => {
  subscriptions[username][eventName] = [];
}

const fireEvent = (username, eventName, data) => {
  if(!(username in subscriptions)) return false;
  if(!(eventName in subscriptions[username])) return false;

  subscriptions[username][eventName].forEach(event => event(data));
}

export default { subscribe, unsubscribe, fireEvent };
