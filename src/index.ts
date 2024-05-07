import { User, UserStatus } from './models/user.model';

import { Achievement } from './models/achievements.model';
import { Group } from './models/group.model';
import { RolePermission } from './models/role-permissions.model';
import { Server } from 'socket.io';
import { Timetable } from './models/timetable.model';
import { UserRole } from './models/user-roles.model';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { defaultAchievements } from './shared/_defaults/achievements';
import { errorHandler } from './middleware/error-handling.middleware';
import express from 'express';
import http from 'http';
import path from 'path';
import { router } from './routes';
import { sequelize } from './db';
import { setupIOevents } from './shared/_defaults/soket.io.settings';

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL as string,
      '*'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  }
});

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
app.use(cookieParser());
app.use('/static', express.static(path.resolve(__dirname , 'static')));
app.set('io', io);
app.use('/api', router);
app.use(errorHandler);

const PORT = process.env.PORT;

setupIOevents(io);

const createDefaultRecords = async () => {
  /* Create default roles */
  const [ studentRole ] = await UserRole.findOrCreate({ where: { title: "Студент" }, defaults: { title: "Студент" } });
  await RolePermission.findOrCreate({ where: { roleId: studentRole.id }, defaults: { roleId: studentRole.id, canEdit: false, canInvite: false } });

  const [ mentorRole ] = await UserRole.findOrCreate({ where: { title: "Староста" }, defaults: { title: "Староста" } });
  await RolePermission.findOrCreate({ where: { roleId: mentorRole.id }, defaults: { roleId: mentorRole.id, canEdit: true, canInvite: true } });

  /** Create default achievements */
  // await Achievement.bulkCreate(defaultAchievements);

  /** Create system account */
  const [ systemGroup ] = await Group.findOrCreate({ where: { name: "Stud.log" }, defaults: { name: "Stud.log" } });
  const systemAcc = await User.findOne({ where: { firstName: "Система", lastName: 'Stud.log' } });
  if(!systemAcc) {
    await User.create({
      firstName: "Система",
      lastName: 'Stud.log',
      roleId: mentorRole.id,
      groupId: systemGroup.id,
      email: 'studlog.help@yandex.ru',
      phone: '+79657514079',
      avatarUrl: '/_defaults/avatars/logo.svg',
      password: '$2a$05$Wh6Bly22KM2UOckjakQ4W.F//fyS.kyaduyLrr9uRp2Y2ygc3InQK',
      status: UserStatus.approved
    });
  }
};

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