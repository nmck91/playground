# Tailwind CSS Shared Configuration

This monorepo uses a **shared Tailwind CSS preset** to ensure consistent design tokens across all applications.

## Architecture

```
playground/
├── tailwind-workspace-preset.js   # Shared design system (single source of truth)
├── apps/
│   ├── family-calendar/
│   │   └── tailwind.config.js     # Extends shared preset
│   └── reward-chart/
│       └── tailwind.config.js     # Extends shared preset
```

## Shared Design Tokens

The `tailwind-workspace-preset.js` file contains:

### Colors
- **Brand Colors**: `cream`, `teal` (primary)
- **Neutrals**: `slate`, `brown`, `charcoal`, `gray`
- **Semantic**: `red` (error), `orange` (warning)
- **Domain-Specific**: `child-1`, `child-2`, `child-3`, `parent`

### Typography
- **Font Families**: `font-base`, `font-mono`
- **Font Sizes**: `text-xs` through `text-4xl`
- **Font Weights**: `font-medium`, `font-semibold`, `font-bold`

### Spacing
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px
- Based on 8px grid system

### Border Radius
- `rounded-sm`: 6px
- `rounded-base`: 8px
- `rounded-md`: 10px
- `rounded-lg`: 12px

### Shadows
- `shadow-xs`: Subtle
- `shadow-sm`: Small
- `shadow-md`: Medium
- `shadow-lg`: Large

## Using the Shared Preset

### In Existing Apps

Both `family-calendar` and `reward-chart` already use the preset:

```javascript
// apps/*/tailwind.config.js
module.exports = {
  presets: [require('../../tailwind-workspace-preset.js')],
  // ... rest of config
};
```

### For New Apps

When creating a new application:

1. Create `apps/your-app/tailwind.config.js`:

```javascript
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

module.exports = {
  // Use shared workspace preset
  presets: [require('../../tailwind-workspace-preset.js')],

  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  theme: {
    extend: {
      // App-specific customizations only
    },
  },

  plugins: [],
};
```

2. All shared design tokens are automatically available!

## Available Utilities

### Colors

```html
<!-- Brand Colors -->
<div class="bg-teal-500 text-white">Primary Action</div>
<div class="bg-cream-50">Neutral Background</div>

<!-- Domain-Specific -->
<div class="border-child-1">Child 1 Card</div>
<div class="bg-parent">Parent Section</div>
```

### Typography

```html
<h1 class="font-base text-4xl font-bold">Heading</h1>
<code class="font-mono text-sm">Code Block</code>
```

### Spacing

```html
<div class="p-16 m-8 space-y-12">
  <!-- Uses shared spacing scale -->
</div>
```

### Border Radius

```html
<button class="rounded-base">Button</button>
<div class="rounded-lg">Card</div>
```

### Shadows

```html
<div class="shadow-sm hover:shadow-md transition-shadow">
  Hover me
</div>
```

## App-Specific Customizations

Individual apps can extend the preset with app-specific tokens:

```javascript
// apps/your-app/tailwind.config.js
module.exports = {
  presets: [require('../../tailwind-workspace-preset.js')],

  theme: {
    extend: {
      colors: {
        'app-accent': '#custom-color',  // App-specific color
      },
      // Other app-specific extensions
    },
  },
};
```

**Important**: Only add app-specific tokens here. Shared tokens should be added to `tailwind-workspace-preset.js`.

## Modifying Shared Tokens

To update design tokens for **all apps**:

1. Edit `tailwind-workspace-preset.js`
2. Changes automatically apply to all applications
3. Rebuild apps to see updates

Example:
```javascript
// tailwind-workspace-preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        teal: {
          500: '#NEW_COLOR',  // Updates primary color everywhere
        },
      },
    },
  },
};
```

## Benefits

✅ **Single Source of Truth**: One place to manage design tokens
✅ **Consistency**: All apps use the same design system
✅ **Maintainability**: Update once, apply everywhere
✅ **Scalability**: New apps inherit the design system automatically
✅ **Flexibility**: Apps can still add custom tokens when needed

## Testing Changes

After modifying the shared preset:

```bash
# Build all apps to verify changes
npx nx run-many -t build

# Or build individually
npx nx build family-calendar
npx nx build reward-chart
```

## Resources

- **Tailwind CSS Presets**: https://tailwindcss.com/docs/presets
- **Nx + Tailwind**: https://nx.dev/recipes/other/using-tailwind-css-with-angular-projects
- **Design System**: See `docs/ui-architecture.md` for complete design system documentation

---

**Last Updated**: 2025-11-08
**Maintained By**: Development Team
