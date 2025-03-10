# Podium League - Solana Wallet Authentication

A sports prediction platform powered by Solana blockchain. This project allows users to connect their Solana wallets, make predictions on sports events, and compete on a leaderboard.

## Features

- **Solana Wallet Authentication**: Connect with popular Solana wallets (Phantom, Solflare, etc.)
- **Protected Routes**: Access to predictions and leaderboard only for authenticated users
- **User Dashboard**: View your stats and recent activity
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/podium-league.git
   cd podium-league
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your Solana wallet by clicking the "Connect Wallet" button in the top right corner.
2. Once connected, you'll have access to:
   - Dashboard: View your stats and recent activity
   - Predictions: Make predictions on upcoming sports events
   - Leaderboard: See how you rank against other users

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **Solana Web3.js**: Solana blockchain interaction
- **Solana Wallet Adapter**: Wallet connection and authentication
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the original [Podium League](https://github.com/builderz-labs/podium-league) project
- Sporting Labs for the design inspiration
