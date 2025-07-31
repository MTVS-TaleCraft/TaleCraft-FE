# TaleCraft Frontend

This is a [Next.js](https://nextjs.org) project for TaleCraft, a novel writing and reading platform.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Configuration

To configure the API endpoint, create a `.env.local` file in the root directory and add:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

If no environment variable is set, the default API URL will be `http://localhost:8081`.

## API Configuration

The project uses a centralized API configuration system located in `src/config/api.ts`. This allows for easy management of API endpoints and base URLs.

### Features:
- Centralized API endpoint management
- Environment variable support for API base URL
- Helper functions for creating API URLs with parameters
- Type-safe API configuration

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable React components
- `src/config/` - Configuration files including API settings

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
