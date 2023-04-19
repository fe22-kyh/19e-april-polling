let itemsVersionUUID = -1;

const backoff = {
  timeout: 3000, // bas timeout
  miss: { 
    min: 4, // min (när timeout börjar öka)
    max: 10, // max (när timeout slutar öka)
    count: 0 // count (hur många gånger den missa (samma version))
  },
  multiplier: 2000 // hur snabbt vi backar av
}

let startTime = Date.now();
const shortPollItems = async () => {

  const fetchOptions = {
    headers: {
      authorization: "Bearer " + sessionStorage.getItem("jwt_token")
    }
  }

  const resp = await fetch("http://localhost:3000/shopping/cart/", fetchOptions);
  const data = await resp.json();

  if(data.version == itemsVersionUUID) {
    console.log("miss");
    if(backoff.miss.count <= backoff.miss.max) {
      backoff.miss.count += 1;
    }
  } else {
    backoff.miss.count = 0;
    itemsVersionUUID = data.version;
    console.log(data.content);
  }

  let timeoutMs = backoff.timeout;

  if (backoff.miss.count > backoff.miss.min) {
    timeoutMs = timeoutMs + (backoff.miss.count * backoff.multiplier);
  }

  console.log((Date.now()) - startTime, "ms")
  setTimeout(shortPollItems, timeoutMs); // upprepa efter 3 sekunder
  startTime = Date.now();
}

const longPollItems = async () => {
  const fetchOptions = {
    headers: {
      authorization: "Bearer " + sessionStorage.getItem("jwt_token")
    }
  }

  const resp = await fetch("http://localhost:3000/subscribe/cart/", fetchOptions);
  const data = await resp.json();

  console.log(data);
  
  longPollItems();
}


const authenticate = async (username) => {
  const fetchOptions = {
    body: JSON.stringify({username}), // "{\n'username:\' \'<username\'}"
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  }

  const resp = await fetch("http://localhost:3000/auth/login/", fetchOptions);
  const data = await resp.json();

  sessionStorage.setItem("jwt_token", data.accessToken);
}

authenticate("bob").then(longPollItems);