import cors from 'cors';
import { errorHandler } from './middleware/error-handling.middleware';
import express from 'express';
import path from 'path';
import { router } from './routes';

const app = express();
const PORT = 9900

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      '*'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  }),
);
app.use(express.json());
app.use('/static', express.static(path.join(__dirname , '/static')));
app.use('/api', router);
app.use(errorHandler);
//TODO: add cookie parser

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});