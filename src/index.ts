import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './middleware/error-handling.middleware';
import express from 'express';
import http from 'http';
import path from 'path';
import { router } from './routes';
import { sequelize } from './db';
import { setupIOevents } from './shared/_defaults/soket.io.settings';
import { corsSettings } from './shared/interfaces/constants';
import { createDefaultRecords } from './shared/_defaults/records';

export const isDev = process.env.NODE_ENV === 'development';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsSettings });

app.use(cors(corsSettings));
app.use(express.json());
app.use(cookieParser());
// Change path because of production build runs from `dist` folder
app.use('/static', express.static(path.resolve(__dirname , isDev ? 'static' : '../src/static')));
app.set('io', io);
app.use('/api', router);
app.use(errorHandler);

const PORT = process.env.PORT;

setupIOevents(io);

const start = async () => {
  try {
    await sequelize.authenticate();
    const alter = true;
    await sequelize.sync({ alter });
    await createDefaultRecords();
    app.listen(Number(PORT), async () => {
      console.log(`Express server started on port ${PORT}`);
    });
    server.listen(Number(PORT) + 1, async () => {
      console.log(`Socket server started on port ${Number(PORT) + 1}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();