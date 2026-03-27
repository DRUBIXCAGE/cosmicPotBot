const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// 🔑 TOKEN
const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// ✅ SAFE FILE LOAD (FIXED FOR RENDER)
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "numerologyData.json"), "utf-8")
);

// 🧠 USER MEMORY
const userState = {};
const userData = {};

// 🔢 NUMBER REDUCTION
function reduceNumber(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split("").reduce((a, b) => a + +b, 0);
  }
  return num;
}

// 🔢 CALCULATE
function calculateNumbers(dob) {
  const digits = dob.replace(/\D/g, "");

  const birth = reduceNumber(parseInt(digits.slice(0, 2)));

  const destiny = reduceNumber(
    digits.split("").reduce((a, b) => a + +b, 0)
  );

  return { birth, destiny };
}

// 📅 FLEXIBLE DOB PARSER
function parseDOB(input) {
  const clean = input.replace(/[^\d]/g, "");
  if (clean.length !== 8) return null;

  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);

  return `${day}-${month}-${year}`;
}

// 📲 MENU
function sendMenu(chatId) {
  bot.sendMessage(chatId, "🧿 Choose your next step:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "💘 Love Match"],
        ["🌌 Time Energy", "🔮 Get Guidance"],
        ["💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// 🌟 CORE RESPONSE (EMOTIONAL + SAFE)
function generateCoreMessage(birth, destiny) {
  const b = data[String(birth)] || {};
  const d = data[String(destiny)] || {};

  const ritual = Array.isArray(b.dailyRitual)
    ? b.dailyRitual.join(", ")
    : b.dailyRitual || "Follow a disciplined daily routine";

  return `🧿 *Your Cosmic Blueprint*

I observed your numbers carefully… and there’s a pattern here.

🔢 *Birth Number:* ${birth}  
🌌 *Destiny Number:* ${destiny}

✨ *Your Nature*  
You are someone who is *${b.nature || "unique, but still unfolding"}*.

🧠 *Your Personality Layer*  
You often appear as *${b.personality || "strong, yet thoughtful"}* to others.

🌠 *Your Life Direction*  
Your journey is guided by *${d.coreTheme || "deep personal growth"}*.

💪 *Your Strength Zone*  
You naturally carry *${b.qualities || "hidden strengths waiting to activate"}*.

⚠️ *Your Inner Conflict*  
Sometimes you struggle with *${b.relationshipIssues || "balancing emotions and logic"}*.

💫 *What You Should Start Doing*  
👉 ${ritual}

🎯 *Alignment Signals*  
Lucky Numbers: ${b.luckyNumbers || "Follow your intuition"}  
Colors: ${b.colors || "Wear what feels right energetically"}

🧿 *Truth About You*  
You are not random.  
You are moving through a pattern designed around *${b.coreTheme || "your purpose"}*.

—

⚡ This is just the surface.

There are deeper patterns in:
• money  
• relationships  
• timing  

👉 Want to unlock that?

📲 WhatsApp: https://wa.me/917895424239  
📩 Telegram: https://t.me/dRubixCage
`;
}

// 🚀 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🧿 Welcome to CosmicPot

Tell me your Date of Birth:

Example:
27-10-1997  
27/10/1997  
27101997`
  );

  userState[chatId] = "WAITING_DOB";
});

// 📩 MAIN HANDLER
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // 📅 DOB INPUT
  if (userState[chatId] === "WAITING_DOB") {
    const dob = parseDOB(text);

    if (!dob) {
      return bot.sendMessage(chatId, "❌ Invalid DOB format");
    }

    userData[chatId] = { dob };
    userState[chatId] = null;

    const { birth, destiny } = calculateNumbers(dob);

    bot.sendMessage(chatId, generateCoreMessage(birth, destiny), {
      parse_mode: "Markdown"
    });

    return sendMenu(chatId);
  }

  // 🔢 CORE ENERGY
  if (text.includes("Core Energy")) {
    if (!userData[chatId]) {
      userState[chatId] = "WAITING_DOB";
      return bot.sendMessage(chatId, "📩 Send your DOB first");
    }

    const { birth, destiny } = calculateNumbers(userData[chatId].dob);

    bot.sendMessage(chatId, generateCoreMessage(birth, destiny), {
      parse_mode: "Markdown"
    });

    return sendMenu(chatId);
  }

  // 💘 LOVE MATCH
  if (text.includes("Love Match")) {
    userState[chatId] = "LOVE_DOB";
    return bot.sendMessage(chatId, "💘 Send your DOB");
  }

  if (userState[chatId] === "LOVE_DOB") {
    const dob = parseDOB(text);
    if (!dob) return bot.sendMessage(chatId, "❌ Invalid DOB");

    userData[chatId] = userData[chatId] || {};
    userData[chatId].love1 = dob;

    userState[chatId] = "LOVE_DOB_2";
    return bot.sendMessage(chatId, "💘 Now send partner DOB");
  }

  if (userState[chatId] === "LOVE_DOB_2") {
    const dob2 = parseDOB(text);
    if (!dob2) return bot.sendMessage(chatId, "❌ Invalid DOB");

    const { birth: b1 } = calculateNumbers(userData[chatId].love1);
    const { birth: b2 } = calculateNumbers(dob2);

    const score = Math.abs(b1 - b2);

    bot.sendMessage(
      chatId,
      `💘 *Love Insight*

You: ${b1}  
Partner: ${b2}

Connection: ${
        score <= 2 ? "Aligned 💫" : "Karmic 🔥"
      }

👉 Full reading:
https://wa.me/917895424239`,
   https://t.me/dRubixCage
      { parse_mode: "Markdown" }
    );

    userState[chatId] = null;
    return sendMenu(chatId);
  }

  // 🔮 GUIDANCE
  if (text.includes("Guidance")) {
    bot.sendMessage(
      chatId,
      `🔮 *Guidance*

Pause before reacting.  
Your clarity is hidden in stillness.

👉 https://wa.me/917895424239`,
    https://t.me/dRubixCage
      { parse_mode: "Markdown" }
    );
    return sendMenu(chatId);
  }

  // 💎 PREMIUM
  if (text.includes("Premium")) {
    bot.sendMessage(
      chatId,
      `💎 *Premium Reading*

Unlock deeper layers:
• Career timing  
• Love cycles  
• Financial patterns  

👉 https://wa.me/917895424239`,
      { parse_mode: "Markdown" }
    );
    return sendMenu(chatId);
  }
});

// 🌐 SERVER (RENDER REQUIREMENT)
const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Bot running 🧿");
});

app.listen(process.env.PORT || 3000);
