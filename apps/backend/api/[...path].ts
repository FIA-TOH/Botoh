import { createApp } from '../src/app';

// Catch-all Vercel serverless entrypoint for /api/* REST routes.
export default createApp({ includePitwallRoutes: false });
