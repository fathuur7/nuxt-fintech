# FinTech App with Supabase

A modern financial technology application built with Nuxt 3 and Supabase.

## Features

- 🔐 **Authentication**: Google OAuth with Supabase Auth
- 💰 **Savings Accounts**: Multiple savings products with real-time interest calculation
- 💬 **Real-time Chat**: Admin-user messaging with Supabase Realtime
- 💳 **Payments**: Midtrans integration for top-up functionality
- 📊 **Admin Dashboard**: User management and analytics
- 🎨 **Modern UI**: Tailwind CSS with glassmorphism effects

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS
- **Payments**: Midtrans
- **Notifications**: Vue Toast Notification
## Setup

### Prerequisites

1. Create a [Supabase](https://supabase.com) project
2. Get your Supabase URL and anon key
3. Set up Google OAuth in Supabase Auth settings
4. Get Midtrans credentials for payment processing

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### Database Setup

1. Run the migrations in your Supabase project:
   - Execute the SQL files in `supabase/migrations/` in order
   - This will create all necessary tables, policies, and functions

2. Configure Google OAuth:
   - Go to Supabase Dashboard > Authentication > Settings
   - Enable Google provider
   - Add your Google OAuth credentials

### Installation

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

```

The application will be available at `http://localhost:3000`

## Production

Build the application for production:

```bash
# npm
npm run build

```

Locally preview production build:

```bash
# npm
npm run preview
```

## Project Structure
# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
