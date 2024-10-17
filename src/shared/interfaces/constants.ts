import { CorsOptions, CorsOptionsDelegate } from "cors";

export const corsSettings: CorsOptions | CorsOptionsDelegate = {
  origin: [
    process.env.FRONTEND_URL as string,
    process.env.FRONTEND_ADMIN_URL as string,
    'https://promo.studlog.ru',
    'https://test.studlog.ru',
    'https://admin.studlog.ru',
    'http://localhost:4173',
    '*'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  credentials: true,
};