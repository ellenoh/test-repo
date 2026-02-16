# Bank of Mom & Dad (BOMAD)

A web app that helps kids keep track of money they receive from family for birthdays, holidays, and more.

## Features

- **Parent accounts** - Add money to your children's accounts, track balances, view transaction history
- **Child accounts** - See your total balance, view a chart of savings over time, and browse your transaction history
- **Family linking** - Parents generate a link code that kids enter to connect accounts
- **Profiles** - Customize your name and avatar color
- **Transaction sources** - Tag money as coming from Grandma, Grandpa, Birthday, Allowance, etc.

## Tech Stack

- **Frontend**: React + Vite + React Router + Recharts
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Auth**: JWT tokens + bcrypt

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Run both server and client in dev mode
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## How It Works

1. **Register** as a Parent or Kid
2. **Parents**: Generate a link code from your dashboard and share it with your child
3. **Kids**: Enter the link code to connect to your parent's account
4. **Parents**: Click on a child to add money and track their balance
5. **Kids**: Watch your savings grow over time with the balance chart
