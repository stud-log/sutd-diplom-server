import cors from 'cors';
import { errorHandler } from './middleware/error-handling.middleware';
import express from 'express';
import path from 'path';
import { router } from './routes';
import { sequelize } from './db';

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL as string,
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

const PORT = process.env.PORT;
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(/*{alter: true}*/);
    app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();