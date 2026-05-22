import { createApp } from '../apps/backend/src/app';

// Root-level Vercel entrypoint for deployments that use the monorepo root.
export default createApp({ includePitwallRoutes: false });
