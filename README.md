
# Trenchers Paper Trading 🧠💸

![Logo](./Images/logo.webp)

**Trenchers Paper Trading** is a Chrome extension designed for paper trading memecoins on [Axiom](https://axiom.trade). Practice your trading strategies without risking real SOL — perfect for beginners and degen explorers.

---

## 🚀 Features

- Seamless UI integrated with Axiom's trading interface
- Real-time simulated balance updates
- Configurable buy/sell presets
- PNL tracking and account management
- Fully client-side and secure (with backend API support)

---

## 🛠 How to Use

### 1. Clone the Repository
```bash
git clone https://github.com/Gadzzaa/TrenchersPaperTrading.git
```

### 2. Install as a Chrome Extension
- Open Chrome and navigate to `chrome://extensions/`
- Enable **Developer Mode**
- Click **Load unpacked** and select the `TrenchersPaperTrading` folder

💡 The extension will auto-inject on any page under `https://axiom.trade/meme/*`.

---

## 📸 Screenshots -- OUTDATED
![Login UI](./Screenshots/img1.png)

![Trading UI](./Screenshots/img2.png)

---

## 🔌 Backend Requirement

> ⚠️ This app requires a backend server to function properly.

You must have **one** of the following backend services running for core features to work:

- [**TPTServer**](https://github.com/Gadzzaa/TPTServer) – Local or self-hosted backend
- **AWS EC2 Server** – Hosted production backend (automatic if deployed environment is configured)

### 🔒 Required for:
- Account login and registration
- Portfolio tracking
- Token buying/selling (simulated trades)

Without a backend connection, the app will run in a read-only mode.

---

## 🎥 Demo Video -- Outdated

A full walkthrough of the extension and backend in action:  
📽️ `Trailer` *(https://youtu.be/snUPfnYgfkY?si=M-MhE1YhrxjvOb4e)*

---

## 📄 License

MIT License © 2025 Gadzzaa
