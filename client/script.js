import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//fn to load our massage
function loader(element) {
  element.textContent = ""; // to be sure its empty at the start

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += "."; // every 300msec, it will add dot

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//fn to giving the answer line by line
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index); // getting the characters under a specific index in the text that API returns
      index++; // increment the index
    } else {
      // when we reach the end of the text
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element

// fn for generat a unique id for every single massage; to be able to map over them
// It is common in JS and many languages to use the current time and date => that is always unique
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16); // we get 16 characters

  return `id-${timeStamp}-${hexadecimalString}`;
}

// fn thet implemente the chat stripping -> from dark gray to light gray and so on...
function chatStripe(isAI, value, uniqueId) {
  // value is the ai generated message
  return `
        <div class="wrapper ${isAI && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                        src=${isAI ? bot : user} 
                        alt="${isAI ? "bot" : "user"}"
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
        `;
}

// fn that is going to be the trigger to get the ai generated responce message
const submitHandler = async (e) => {
  e.preventDefault(); // the default browser behaviour when submit is to reload the browser

  const data = new FormData(form);

  // now we need to start user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset(); // finaly we need to clear the input field

  // now we need to make bot's chatStripe
  // first we need to make a unique id for the bot's chat
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // the second parameter is a string with one empty space as that is going to fill it up later on by loading fn

  // as the user is typing, we want to keeping scroll down to be able to see that message
  chatContainer.scrollTop = chatContainer.scrollHeight; // this is going to put the new message in view

  // now we want to fetch this newlly created div
  const messageDiv = document.getElementById(uniqueId);

  // finally we need to turn on the loader
  loader(messageDiv);

  // fetch data from server -> bot's response
  const response = await fetch("https://chatgpt-50sm.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"), // this is the data or message comes from our textarea element on the screen
    }),
  });
  //  after we get the data , we need to clear the screen
  clearInterval(loadInterval);
  messageDiv.innerHTML = ""; //  as we not sure which point of loading we are now
  if (response.ok) {
    const data = await response.json(); // this gives us the actual response  comes from the backend
      const parsedData = data.bot.trim();
    // finally we can pass it to thetypeText fn
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

// now to be able to see the changes that made to our submitHandler , we have to how call it
form.addEventListener("submit", submitHandler);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    submitHandler(e);
  }
});

// now we getting ready to create our own backend application that going to be make
//   a call to the open AIs chatGPT API


// fpffg2@gmail.com,   Qwertyuipo1@