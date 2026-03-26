const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

const userState = {};
const userData = {};

// 🔢 Calculate numbers
function reduceNumber(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split("").reduce((a, b) => a + +b, 0);
  }
  return num;
}

function calculateNumbers(dob) {
  const digits = dob.replace(/\D/g, "");

  const birth = reduceNumber(parseInt(digits[0] + digits[1]));
  const destiny = reduceNumber(
    digits.split("").reduce((a, b) => a + +b, 0)
  );

  return { birth, destiny };
}

// 📅 Flexible DOB parser
function parseDOB(input) {
  const clean = input.replace(/[^\d]/g, "");
  if (clean.length !== 8) return null;

  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);

  return `${day}-${month}-${year}`;
}

// 💬 Main Menu
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

// 🌟 Core Energy Response (EMOTIONAL + PERSONAL)
function generateCoreMessage(birth, destiny) {
  const b = data[birth];
  const d = data[destiny];

  return `🧿 *Your Cosmic Blueprint*

I looked into your numbers… and this is what they quietly reveal about you:

🔢 *Birth Number: ${birth}*
🌌 *Destiny Number: ${destiny}*

✨ *Your Nature*  
You are someone who is ${b.nature.toLowerCase()}.  
Not everyone understands this about you… but it defines how you move through life.

🧠 *Your Personality*  
You naturally come across as ${b.personality.toLowerCase()}.  
People often see your strength… but not always the depth behind it.

🌠 *Your Life Path*  
Your journey is guided by ${d.coreTheme.toLowerCase()}.  
This is not random… this is what your life keeps pulling you toward.

💪 *Your Strength*  
You carry ${b.qualities.toLowerCase()} within you.  
This is your natural power… use it consciously.

⚠️ *Your Inner Challenge*  
At times, you may face ${b.relationshipIssues.toLowerCase()}.  
This is where your growth is hidden.

💫 *A Small Guidance for You*  
Start doing this regularly: *${b.dailyRitual}*  
It may look simple… but it aligns your energy deeply.

🎯 *Your Natural Alignment*  
Your energy resonates with numbers: *${b.luckyNumbers}*  
And colors like *${b.colors}* amplify your presence.

🧿 *One Truth About You*  
You are not here randomly…  
your life is quietly shaped around *${b.coreTheme.toLowerCase()}*

—

If this felt accurate… it’s because this is just the surface.

👉 For deeper personal reading:  
https://wa.me/917895424239  
📩 Telegram: https://t.me/drubixCage
`;
}

// 🚀 START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🧿 Welcome to CosmicPot

Before we begin… tell me your Date of Birth.

You can type it in any format:
27-10-1997 / 27/10/1997 / 27101997

I’ll understand.`
  );

  userState[chatId] = "WAITING_DOB";
});

// 📩 MESSAGE HANDLER
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // 👉 If waiting DOB
  if (userState[chatId] === "WAITING_DOB") {
    const dob = parseDOB(text);

    if (!dob) {
      return bot.sendMessage(
        chatId,
        "❌ That doesn’t look right.\nTry like: 27-10-1997"
      );
    }

    userData[chatId] = { dob };
    userState[chatId] = null;

    bot.sendMessage(chatId, `📌 Got it… *${dob}*\n\nLet me read this… 🧿`, {
      parse_mode: "Markdown"
    });

    const { birth, destiny } = calculateNumbers(dob);

    const message = generateCoreMessage(birth, destiny);

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

    return sendMenu(chatId);
  }

  // 👉 Core Energy
  if (text.includes("Core Energy")) {
    if (!userData[chatId]) {
      userState[chatId] = "WAITING_DOB";
      return bot.sendMessage(chatId, "📩 First, send your DOB");
    }

    const { birth, destiny } = calculateNumbers(userData[chatId].dob);
    const message = generateCoreMessage(birth, destiny);

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    return sendMenu(chatId);
  }

  // 👉 Love Match
  if (text.includes("Love Match")) {
    userState[chatId] = "LOVE_DOB";
    return bot.sendMessage(chatId, "💘 Send your DOB first");
  }

  if (userState[chatId] === "LOVE_DOB") {
    const dob = parseDOB(text);
    if (!dob) return bot.sendMessage(chatId, "❌ Invalid DOB");

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

⚡ Energy Gap: ${score}

This connection feels ${
        score <= 2 ? "naturally aligned 💫" : "intense & karmic 🔥"
      }

👉 Want deeper relationship decoding?  
https://wa.me/917895424239`,
      { parse_mode: "Markdown" }
    );

    userState[chatId] = null;
    return sendMenu(chatId);
  }

  // 👉 Guidance
  if (text.includes("Guidance")) {
    bot.sendMessage(
      chatId,
      `🔮 *Personal Guidance*

Right now… your energy is asking for clarity.

Slow down. Observe. Don’t react instantly.

Your next breakthrough will come from *awareness*, not action.

👉 For deeper personal guidance:  
https://wa.me/917895424239  
📩 Telegram: https://t.me/drubixCage`,
      { parse_mode: "Markdown" }
    );

    return sendMenu(chatId);
  }

  // 👉 Premium
  if (text.includes("Premium")) {
    bot.sendMessage(
      chatId,
      `💎 *Premium Reading*

This is where we go deeper:

✔ Detailed life prediction  
✔ Career & money timing  
✔ Relationship patterns  
✔ Personal remedies  

👉 Start here:  
https://wa.me/917895424239`,
      { parse_mode: "Markdown" }
    );

    return sendMenu(chatId);
  }
});

// 🌐 SERVER
const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Bot is running...");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
