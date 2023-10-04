import express from 'express';
import cors from 'cors';
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
app.use('/api', router);


app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});