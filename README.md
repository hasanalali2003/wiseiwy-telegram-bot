Here's a complete and detailed `README.md` file for your GitHub repository:

---

# 🤖 Wiseiwy Telegram Bot

A custom **Telegram bot** developed using **Node.js** and **node-telegram-bot-api** to manage users and digital giftcard transactions in the **WISEIWY** community. This bot includes powerful admin and user panels to handle giftcard sales, rate management, user control, and invoicing.

---

## 🛠 Technologies Used

* **Node.js** — Backend server and bot logic
* **node-telegram-bot-api** — Telegram Bot API wrapper for Node.js
* **MongoDB + Mongoose** — NoSQL database for storing user data, giftcards, rates, etc.

---

## 📌 Features

### 🧍‍♂️ User Panel

Users have access to a simple interface to:

* Submit giftcards for sale
* Select giftcard **country** and **type**
* Enter giftcard **value**, **PIN**, and **optional link**

All submissions are stored and visible to admins for review and price evaluation.

---

### 🛡️ Admin Panel

Admins have access to a complete set of controls to manage the platform:

#### 🎯 Giftcard Pricing

* Set giftcard prices based on **country** and **type**
* Update prices dynamically

#### 💱 Exchange Rate

* Set the current exchange rate (e.g., USD → local currency)

#### 👥 User Management

* View paginated user list
* Delete users
* Promote or demote users to/from admin
* View user-specific giftcards
* Delete individual or all giftcards from users

#### 💳 Billing

* Automatically **calculate total value** of giftcards (using price × value × exchange rate)
* Generate and send **invoice** directly to users

#### 📢 Broadcast Messaging

* Send announcements or messages to **all users** instantly

---

## 📦 Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/wiseiwy-telegram-bot.git
   cd wiseiwy-telegram-bot
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add:

   ```
   BOT_TOKEN=your_telegram_bot_token
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Start the Bot**

   ```bash
   node index.js
   ```

---

## 🗂️ Project Structure

```
wiseiwy-telegram-bot/
├── models/           # Mongoose schemas for User, GiftCard, Rate, etc.
├── services/         # Price calculation and helpers
├── state/            # Temporary per-chat storage
├── handlers/         # Callback & message handlers
├── index.js          # Entry point
└── .env              # Environment variables
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change or improve.

---

## 🙌 Acknowledgments

Special thanks to the **WISEIWY team** for supporting this project and providing valuable feedback during development.
