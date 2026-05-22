import { createApp } from '../src/app';

// Vercel serverless entrypoint: REST only, no Socket.IO and no room/pitwall routes.
export default createApp({ includePitwallRoutes: false });
