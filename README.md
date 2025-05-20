# Neftit Waitlist

A modern, type-safe waitlist application built with Next.js 14, Supabase, and Tailwind CSS. Features a referral system, social integrations, and beautiful UI animations.

## Features

- 🎯 Email-based waitlist signup with validation
- 🔄 Multi-step form with smooth transitions
- 🔗 Social platform username collection (Twitter/X, Discord)
- 📊 Built-in referral system with unique codes
- 📈 Real-time referral tracking
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Type-safe database operations with Supabase
- ⚡ Server Actions for efficient data handling
- 🌐 SEO optimized

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: Supabase Auth
- **Type Safety**: TypeScript
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm
- A Supabase account

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/neftit-waitlist.git
cd neftit-waitlist
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

4. Set up Supabase:
   - Create a new project at https://supabase.com
   - Go to the SQL editor
   - Run the SQL from `src/lib/create_rpc.sql`
   - Copy your project credentials to `.env.local`

5. Start the development server:
```bash
pnpm dev
```

## Database Schema

The application uses a single table with the following structure:

```sql
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text NOT NULL UNIQUE,
  twitter_username text,
  discord_username text,
  referral_code text UNIQUE,
  referral_count integer DEFAULT 0,
  status text DEFAULT 'pending'::text
);
```

## API Routes

All data operations use Next.js Server Actions for optimal performance:

- `submitWaitlistEmail`: Handles initial signup
- `updateTwitterUsername`: Updates Twitter/X handle
- `updateDiscordUsername`: Updates Discord username
- `getUserReferralInfo`: Retrieves referral statistics

## Deployment

1. Create a new project on Vercel:
```bash
vercel
```

2. Add environment variables to your Vercel project
3. Deploy:
```bash
vercel deploy --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development

### File Structure

```
src/
├── components/    # React components
├── lib/          # Utilities and server actions
└── app/          # Next.js app router pages
```

### Component Architecture

- `WaitlistForm`: Main form component with multi-step logic
- `StepIndicator`: Progress visualization
- `ReferralLink`: Shareable referral link component
- `SocialButton`: Unified social platform buttons

### Testing

Run the test suite:
```bash
pnpm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the amazing framework