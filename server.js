const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { getFullNumerology } = require("./numberEngine");

const app = express();
app.use(express.json());

// 🔑 ENV
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// 📂 LOAD DATA
const numerologyData = JSON.parse(
  fs.readFileSync("./numerologyData.json", "utf-8")
);

// 🧠 USER MEMORY (temporary)
let users = {};

// 📅 DOB PARSER (supports multiple formats)
function parseDOBFlexible(input) {
  const cleaned = input.replace(/[\/.\s]/g, "-");
  const parts = cleaned.split("-").map(Number);

  if (parts.length !== 3) return null;

  let [d, m, y] = parts;

  if (y < 100) y += 1900; // basic fallback

  if (!d || !m || !y) return null;

  return `${String(d).padStart(2, "0")}-${String(m).padStart(
    2,
    "0"
  )}-${y}`;
}

// 🎛️ MAIN MENU
function sendMenu(chatId) {
  bot.sendMessage(chatId, "🔮 Choose your next step:", {
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

// 🚀 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🔮 Welcome to CosmicPot

You are not here by chance.
Your numbers brought you here.

Send your Date of Birth:
(DD-MM-YYYY)

Example: 27-10-1997`
  );

  sendMenu(chatId);
});

// 🧾 HANDLE MESSAGES
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  // 📌 MENU ACTIONS
  if (
    text === "🔢 Core Energy" ||
    text === "🌌 Time Energy" ||
    text === "🔮 Get Guidance"
  ) {
    if (users[chatId]?.dob) {
      bot.sendMessage(
        chatId,
        `📌 Your saved DOB: ${users[chatId].dob}

1️⃣ Use this DOB  
2️⃣ Enter new DOB`
      );
      users[chatId].pendingAction = text;
      return;
    } else {
      bot.sendMessage(chatId, "📩 Send your DOB first (DD-MM-YYYY)");
      users[chatId] = { pendingAction: text };
      return;
    }
  }

  if (text === "💞 Love Match") {
    bot.sendMessage(chatId, "💞 Send your DOB");
    users[chatId] = { step: "love1" };
    return;
  }

  if (text === "💎 Premium Reading") {
    bot.sendMessage(
      chatId,
      `💎 This is where real transformation begins.

Your full life decoding is not random.
It’s personal.

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage`
    );
    sendMenu(chatId);
    return;
  }

  // ❤️ LOVE FLOW
  if (users[chatId]?.step === "love1") {
    const dob = parseDOBFlexible(text);
    if (!dob) {
      bot.sendMessage(chatId, "❌ Send DOB properly");
      return;
    }
    users[chatId].dob1 = dob;
    users[chatId].step = "love2";
    bot.sendMessage(chatId, "💞 Now send partner DOB");
    return;
  }

  if (users[chatId]?.step === "love2") {
    const dob = parseDOBFlexible(text);
    if (!dob) {
      bot.sendMessage(chatId, "❌ Send DOB properly");
      return;
    }

    const n1 = getFullNumerology(users[chatId].dob1);
    const n2 = getFullNumerology(dob);

    const score =
      Math.abs(n1.birth - n2.birth) <= 2 ? "🔥 Strong" : "⚡ Challenging";

    bot.sendMessage(
      chatId,
      `💞 Love Compatibility

You: ${n1.birth}
Partner: ${n2.birth}

Result: ${score}

👉 Want real compatibility analysis?

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage`
    );

    users[chatId] = {};
    sendMenu(chatId);
    return;
  }

  // 📅 DOB INPUT
  const dob = parseDOBFlexible(text);

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
    bot.sendMessage(chatId, "❌ Data not found");
    return;
  }

  // 🔢 CORE ENERGY OUTPUT
  const message = `
🔮 Cosmic Profile

Birth Number: ${num.birth}
Destiny Number: ${num.destiny}

✨ ${data.title}

🧠 Traits:
${data.traits}

💪 Strengths:
${data.strengths}

⚠️ Challenge:
${data.weakness}

🧿 Remedies:
${data.remedies.join(", ")}

---

You are not random.

You are reacting to patterns…
patterns created by your own numbers.

And once you see them clearly,
your entire direction shifts.

👉 Want full personal decoding?

📲 WhatsApp:
https://wa.me/917895424239

📩 Telegram:
https://t.me/dRubixCage
`;

  bot.sendMessage(chatId, message);

  sendMenu(chatId);
});

// 🌐 SERVER
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
