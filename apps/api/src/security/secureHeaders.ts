import helmet from 'helmet';
import type { Application } from 'express';

export function applySecureHeaders(app: Application) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
}
