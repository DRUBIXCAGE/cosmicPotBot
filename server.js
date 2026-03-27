const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// ✅ FIXED FILE NAME
const data = JSON.parse(fs.readFileSync("./numerologyData.json", "utf-8"));

const userState = {};
const userData = {};

// 🔢 NUMBER REDUCTION
function reduceNumber(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split("").reduce((a, b) => a + +b, 0);
  }
  return num;
}

// 🔢 CALCULATION
function calculateNumbers(dob) {
  const digits = dob.replace(/\D/g, "");

  const birth = reduceNumber(parseInt(digits.slice(0, 2)));

  const destiny = reduceNumber(
    digits.split("").reduce((a, b) => a + +b, 0)
  );

  return { birth, destiny };
}

// 📅 DOB PARSER
function parseDOB(input) {
  const clean = input.replace(/[^\d]/g, "");
  if (clean.length !== 8) return null;

  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);

  return `${day}-${month}-${year}`;
}

// 💬 MENU
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

// 🌟 CORE MESSAGE (FIXED SAFE)
function generateCoreMessage(birth, destiny) {
  const b = data[String(birth)] || {};
  const d = data[String(destiny)] || {};

  const ritual = Array.isArray(b.dailyRitual)
    ? b.dailyRitual.join(", ")
    : b.dailyRitual || "Follow a consistent daily routine";

  return `🧿 *Your Cosmic Blueprint*

I looked into your numbers… and something about you stood out.

🔢 *Birth Number:* ${birth}  
🌌 *Destiny Number:* ${destiny}

✨ *Your Nature*  
You are someone who is ${b.nature || "unique in your own way"}.

🧠 *How People See You*  
You come across as ${b.personality || "strong and thoughtful"}.

🌠 *Your Life Direction*  
Your journey revolves around ${d.coreTheme || "self-discovery and growth"}.

💪 *Your Strength*  
You carry ${b.qualities || "hidden strengths"} within you.

⚠️ *Your Inner Conflict*  
Sometimes you struggle with ${b.relationshipIssues || "internal balance"}.

💫 *Guidance for You*  
Start doing this: *${ritual}*

🎯 *Alignment*  
Lucky Numbers: ${b.luckyNumbers || "Not defined"}  
Colors: ${b.colors || "Follow what attracts you"}

🧿 *Truth About You*  
You are not random…  
Your life is shaped around *${b.coreTheme || "your inner purpose"}*

—

⚡ This is just surface-level.

👉 Your deeper patterns (money, love, timing) are still hidden.

📲 WhatsApp: https://wa.me/917895424239  
📩 Telegram: https://t.me/drubixCage
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
27-10-1997 / 27/10/1997 / 27101997`
  );

  userState[chatId] = "WAITING_DOB";
});

// 📩 HANDLER
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // DOB INPUT
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

  // CORE ENERGY
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

  // LOVE MATCH
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
      { parse_mode: "Markdown" }
    );

    userState[chatId] = null;
    return sendMenu(chatId);
  }

  // GUIDANCE
  if (text.includes("Guidance")) {
    bot.sendMessage(
      chatId,
      `🔮 *Guidance*

Slow down. Observe. Don’t react fast.

Clarity will come from awareness.

👉 https://wa.me/917895424239`,
      { parse_mode: "Markdown" }
    );
    return sendMenu(chatId);
  }

  // PREMIUM
  if (text.includes("Premium")) {
    bot.sendMessage(
      chatId,
      `💎 *Premium Reading*

Unlock:
• Career timing  
• Love patterns  
• Money cycles  

👉 https://wa.me/917895424239`,
      { parse_mode: "Markdown" }
    );
    return sendMenu(chatId);
  }
});

// 🌐 SERVER
const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Bot running 🧿");
});

app.listen(process.env.PORT || 3000);
