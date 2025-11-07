# Family Calendar App

A modern, responsive family calendar application built with Angular and Nx, with optional Supabase integration for cloud storage.

## Features

- ✅ **Monthly calendar view** with intuitive navigation
- ✅ **Event management** (Create, Read, Update, Delete)
- ✅ **Color-coded categories** (Work, Kids, Personal, Family, Sports, School, Appointment, Other)
- ✅ **Recurring events** (Daily, Weekly, Monthly, Yearly)
- ✅ **Event details** (Title, description, location, time, attendees)
- ✅ **Responsive design** (Works on desktop and mobile)
- ✅ **Data persistence** (localStorage or Supabase)

## Getting Started

### Running the App

```bash
# Start the development server
nx serve family-calendar --port 4201

# Open in your browser
# http://localhost:4201
```

### Using the App

1. **View Calendar** - Click on any date to see events for that day
2. **Add Event** - Click the "+ Add Event" button in the header
3. **Edit Event** - Click the ✏️ button on any event card
4. **Delete Event** - Click the 🗑️ button on any event card

## Supabase Integration

The app supports cloud storage via Supabase. Follow the setup instructions in `SUPABASE_SETUP.md` to enable cloud sync.

### Current Storage Mode

- **Without Supabase**: Events are stored in browser localStorage
- **With Supabase**: Events are synced to your Supabase database

### Setting Up Supabase

1. Follow instructions in `SUPABASE_SETUP.md`
2. Add your Supabase credentials to `src/environments/environment.ts`
3. Restart the dev server

The app will automatically detect Supabase configuration and switch to cloud storage!

## Project Structure

```
apps/family-calendar/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── calendar/          # Main calendar view
│   │   │   └── event-form/        # Add/edit event modal
│   │   ├── models/
│   │   │   └── event.model.ts     # TypeScript interfaces
│   │   ├── services/
│   │   │   ├── event.service.ts   # Event management (with Supabase support)
│   │   │   └── supabase.service.ts # Supabase client
│   │   └── app.ts                 # Main app component
│   ├── environments/
│   │   ├── environment.ts         # Development config
│   │   └── environment.prod.ts    # Production config
│   └── styles.css                 # Global styles
├── SUPABASE_SETUP.md             # Supabase setup instructions
└── README.md                      # This file
```

## Event Categories

Each event can be assigned to one of these categories:

- 🔵 **Work** - Work-related events
- 🟠 **Kids** - Children's activities
- 🟣 **Personal** - Personal appointments
- 🟢 **Family** - Family events
- 🔴 **Sports** - Sports and fitness
- 🔵 **School** - School events
- 🔴 **Appointment** - Medical and other appointments
- ⚫ **Other** - Miscellaneous events

## Recurring Events

Set up recurring events with:
- **Frequency**: Daily, Weekly, Monthly, or Yearly
- **Interval**: Repeat every X days/weeks/months
- **End date** (optional): When to stop recurring

## Technology Stack

- **Frontend**: Angular 20 (Standalone Components)
- **Build Tool**: Nx + esbuild
- **Styling**: CSS (with Tailwind utilities)
- **Backend** (optional): Supabase
- **Testing**: Jest + Playwright

## Development

### Build

```bash
nx build family-calendar
```

### Test

```bash
# Unit tests
nx test family-calendar

# E2E tests
nx e2e family-calendar-e2e
```

### Lint

```bash
nx lint family-calendar
```

## Future Enhancements

- [ ] User authentication
- [ ] Multiple user calendars
- [ ] Event reminders/notifications
- [ ] Export to iCal/Google Calendar
- [ ] Share events via link
- [ ] Event conflict detection
- [ ] Drag-and-drop rescheduling
- [ ] Week and day views
- [ ] Event search and filtering

## License

Private project for family use.
