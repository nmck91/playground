# Appendix - Useful Commands and Scripts

## Frequently Used Commands

```bash
# Development
npx nx serve family-calendar       # Start dev server (port 4200)
npx nx serve reward-chart          # Start dev server (port 4300)

# Production Builds
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production

# Testing
npx nx test family-calendar        # Unit tests
npx nx e2e family-calendar-e2e     # E2E tests
npx nx run-many -t test            # All unit tests
npx nx run-many -t lint test build e2e  # Full CI suite

# Code Quality
npx nx lint family-calendar        # ESLint
npx nx run-many -t lint            # Lint all projects

# Nx Utilities
npx nx graph                       # Visualize project dependencies
npx nx show project family-calendar  # Show project details
npx nx list                        # List installed plugins
npx nx affected -t test            # Test only affected projects

# Generators
npx nx g @nx/angular:component my-component --project=reward-chart
npx nx g @nx/angular:service my-service --project=family-calendar
npx nx g @nx/js:library my-lib --directory=libs/my-lib

# Vercel CLI (if installed)
npx vercel ls                      # List deployments
npx vercel inspect [deployment-url]  # Inspect deployment
```

## Debugging and Troubleshooting

**Common Issues**:

1. **"Could not find Nx modules"**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Supabase connection failing**:
   - Check `.env` files exist in app directories
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
   - Check browser console for Supabase client errors

3. **Build failing on Vercel**:
   - Ensure `vercel.json` is at workspace root
   - Verify Root Directory is set to `.` in Vercel dashboard
   - Check `package-lock.json` is committed and in sync

4. **Bundle size warnings**:
   - Expected behavior with PrimeNG and Supabase
   - Can be ignored for personal projects
   - For optimization: analyze with `npx nx build --stats-json` and webpack-bundle-analyzer

**Logs**:
- **Build logs**: Nx output in terminal
- **Dev server**: `http://localhost:4200` or `http://localhost:4300`
- **CI logs**: GitHub Actions tab in repository
- **Deployment logs**: Vercel dashboard

---
