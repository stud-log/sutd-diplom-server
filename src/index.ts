import { RolePermission } from './models/role-permissions.model';
import { UserRole } from './models/user-roles.model';
import cookieParser from 'cookie-parser';
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
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname , '/static')));
app.use('/api', router);
app.use(errorHandler);

const PORT = process.env.PORT;

const createDefaultRecords = async () => {
  /* Create default roles */
  const [ studentRole ] = await UserRole.findOrCreate({ where: { title: "Студент" }, defaults: { title: "Студент" } });
  await RolePermission.findOrCreate({ where: { roleId: studentRole.id }, defaults: { roleId: studentRole.id, canEdit: false, canInvite: false } });

  const [ mentorRole ] = await UserRole.findOrCreate({ where: { title: "Староста" }, defaults: { title: "Староста" } });
  await RolePermission.findOrCreate({ where: { roleId: mentorRole.id }, defaults: { roleId: mentorRole.id, canEdit: true, canInvite: true } });

  /* Create default roles */
};

const start = async () => {
  try {
    await sequelize.authenticate();
    const alter = false;
    await sequelize.sync({ alter });
    await createDefaultRecords();
    app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();