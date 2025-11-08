# Family Reward Chart App 🌟

A revolutionary two-way accountability reward system where **everyone** earns stars - kids AND parents!

## What Makes This Special

- **Kids track:** Fíadh, Sé, and Niall Óg earn stars for good behavior
- **Parents get tracked too!** Mum and Dad earn stars when kids verify they're keeping promises
- Beautiful, touch-friendly interface
- Supabase backend for multi-device sync
- Weekly tracking with historical records

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase (Required!)

Follow the guide in `docs/supabase-setup.md`:

1. Create Supabase project at https://supabase.com
2. Run `docs/supabase-schema.sql` in Supabase SQL Editor
3. Create a user account in Supabase Auth
4. Update user ID in `docs/supabase-seed-data.sql` and run it
5. Copy your Project URL and API key

### 3. Start Development Server

```bash
# Serve the app
nx serve reward-chart

# Open browser to:
# http://localhost:4200
```

### 4. Build for Production

```bash
nx build reward-chart --configuration=production
```

## Project Structure

```
playground/
├── apps/
│   └── reward-chart/          # Main Angular app
│       ├── public/
│       │   └── index.html     # Working prototype (with Fíadh, Sé, Niall Óg)
│       └── src/               # Angular app source (future migration)
├── docs/
│   ├── brief.md               # Project brief with full requirements
│   ├── example/               # Original CSV charts and prototype
│   ├── supabase-setup.md      # Step-by-step Supabase guide
│   ├── supabase-schema.sql    # Database schema
│   ├── supabase-seed-data.sql # Initial data (Fíadh, Sé, Niall Óg, Mum, Dad)
│   └── implementation-guide.md # Development roadmap
```

## Features

### Kids Section
- Track 5 daily habits:
  - Brushing teeth (morning & night)
  - Tidying up
  - Homework/Reading
  - Being kind to siblings
  - Using good manners
- Earn rewards (20-30 stars): activities, treats, special privileges

### Parents Section (The Game-Changer!)
- Track 5 parent behaviors:
  - Playing with us when asked
  - Not being grumpy in the morning
  - Reading bedtime story with voices
  - Making our favorite meal
  - Taking us somewhere fun
- Parent rewards (15-30 stars): kids make cards, tidy up, breakfast in bed, no nagging!

## Current Status

✅ **Working prototype** with all UI/UX complete
✅ **Database schema** designed and tested
✅ **Names updated** to Fíadh, Sé, Niall Óg
🚧 **Next:** Add Supabase persistence layer
📋 **Future:** Migrate to Angular components

## Technology Stack

- **Frontend:** Angular 19 + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Styling:** Custom design tokens (cream/teal theme)
- **Build:** Nx monorepo
- **Deployment:** TBD (Vercel/Netlify recommended)

## Documentation

- **Project Brief:** `docs/brief.md` - Full requirements and vision
- **Setup Guide:** `docs/supabase-setup.md` - Supabase configuration
- **Implementation:** `docs/implementation-guide.md` - Development plan
- **Database Schema:** `docs/supabase-schema.sql` - Full schema with RLS

## Development

```bash
# Serve app
nx serve reward-chart

# Run tests
nx test reward-chart

# Lint
nx lint reward-chart

# Run e2e tests
nx e2e reward-chart-e2e
```

## Deployment

The app can be deployed to:
- Vercel (recommended)
- Netlify
- Any static hosting + Supabase backend

## Family Members

- **Fíadh** (Sky Blue #87CEEB)
- **Sé** (Light Green #90EE90)
- **Niall Óg** (Plum #DDA0DD)
- **Mum** (Yellow #FFE55C)
- **Dad** (Yellow #FFE55C)

## Contributing

This is a personal family project, but feel free to fork for your own family!

## License

Private family use - not for redistribution

---

Built with ❤️ for the McKinney family
