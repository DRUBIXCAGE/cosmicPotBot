const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const { getFullNumerology } = require("./numberEngine");

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// LOAD DATA
let numerologyData = {};
try {
  const filePath = path.join(__dirname, "numerologyData.json");
  numerologyData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (err) {
  console.error("Error loading numerologyData.json", err);
  process.exit(1);
}

// USER MEMORY
const users = {};

// FLEX DOB PARSER
function parseDOB(input) {
  const clean = input.replace(/[\/.\s]/g, "-");
  const parts = clean.split("-").map(Number);

  if (parts.length !== 3) return null;

  let [d, m, y] = parts;
  if (!d || !m || !y) return null;

  if (y < 100) y += 1900;

  return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
}

// MENU
function menu(chatId) {
  bot.sendMessage(chatId, "✨ What do you want to explore next?", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "💞 Love Match"],
        ["🌌 Time Energy", "🔮 Get Guidance"],
        ["💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
`🔮 Welcome to CosmicPot

Some people come here out of curiosity…

But some arrive because something inside them
is quietly asking for answers.

If you're here, you're probably the second one.

📩 Send your Date of Birth  
(DD-MM-YYYY)

Example: 27-10-1997`
  );

  menu(chatId);
});

// MAIN HANDLER
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  // MENU BUTTONS
  if (
    text === "🔢 Core Energy" ||
    text === "🌌 Time Energy" ||
    text === "🔮 Get Guidance"
  ) {
    if (users[chatId]?.dob) {
      bot.sendMessage(
        chatId,
`📌 I remember your DOB: ${users[chatId].dob}

Do you want me to go deeper with this  
or explore something new?

1️⃣ Use this DOB  
2️⃣ Enter new DOB`
      );
      users[chatId].pending = text;
      return;
    } else {
      bot.sendMessage(chatId, "📩 Send your DOB first");
      users[chatId] = { pending: text };
      return;
    }
  }

  // LOVE MATCH
  if (text === "💞 Love Match") {
    bot.sendMessage(chatId,
`💞 Love is never random…

Send your DOB first`);
    users[chatId] = { step: "love1" };
    return;
  }

  if (users[chatId]?.step === "love1") {
    const dob = parseDOB(text);
    if (!dob) {
      bot.sendMessage(chatId, "❌ Send DOB properly");
      return;
    }

    users[chatId].dob1 = dob;
    users[chatId].step = "love2";

    bot.sendMessage(chatId,
`Now send their DOB…

Let’s see what energy connects you both`);
    return;
  }

  if (users[chatId]?.step === "love2") {
    const dob = parseDOB(text);
    if (!dob) {
      bot.sendMessage(chatId, "❌ Send DOB properly");
      return;
    }

    const n1 = getFullNumerology(users[chatId].dob1);
    const n2 = getFullNumerology(dob);

    const score =
      Math.abs(n1.birth - n2.birth) <= 2 ? "🔥 Deep pull" : "⚡ Karmic friction";

    bot.sendMessage(
      chatId,
`💞 Love Compatibility

You: ${n1.birth}
Partner: ${n2.birth}

Result: ${score}

This connection isn't random.

It either teaches…  
or transforms.

👉 Want to know *why* this bond exists?

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage`
    );

    users[chatId] = {};
    menu(chatId);
    return;
  }

  // PREMIUM
  if (text === "💎 Premium Reading") {
    bot.sendMessage(
      chatId,
`💎 What you’ve seen so far…

is barely 20% of your pattern.

The rest?

Hidden in layers you don’t consciously notice.

👉 Full decoding here:

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage`
    );
    menu(chatId);
    return;
  }

  // DOB INPUT
  const dob = parseDOB(text);

  if (!dob) {
    if (text !== "1" && text !== "2") {
      bot.sendMessage(chatId, "❌ Send DOB like 27-10-1997");
    }
    return;
  }

  users[chatId] = { dob };

  const num = getFullNumerology(dob);
  const data = numerologyData[num.birth];

  if (!data) {
    bot.sendMessage(chatId, "❌ Missing data");
    return;
  }

  // CORE RESPONSE (EMOTIONAL ENGINE)
  const message = `
🔮 Your Cosmic Blueprint

Birth Number: ${num.birth}  
Destiny Number: ${num.destiny}

---

✨ ${data.title}

🧠 The way you think:
${data.traits}

💪 What naturally works in your favor:
${data.strengths}

⚠️ The silent pattern you struggle with:
${data.weakness}

🧿 What balances your energy:
${data.remedies.join(", ")}

---

If you're honest with yourself…

you’ve felt this pattern before, haven’t you?

Moments where things repeat…  
reactions you can't fully explain…

That’s not coincidence.

That’s your number playing out.

👉 Want to break the pattern  
instead of repeating it?

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage
`;

  bot.sendMessage(chatId, message);

  menu(chatId);
});

// SERVER
app.get("/", (req, res) => {
  res.send("Bot running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
