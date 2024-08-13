import { config } from 'dotenv';
import express from 'express';
import db from './src/config/prisma.js';
import userRoutes from './src/routes/user.routes.js';
import uploadFileRoutes from './src/routes/file.routes.js';
import bodyParser from 'body-parser';
import accountProfileRoutes from './src/routes/account.routes.js';
import chalk from 'chalk';

config()
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST;

const app = express();
const version = '/wms/api/v1'
app.use(express.json(), bodyParser.json());

app.use(
    `${version}`,
    userRoutes,
    uploadFileRoutes,
    accountProfileRoutes
)

app.listen(PORT, async () => {
    try {
        await db.$connect();
        const message = 'Database connection succesfull from';
        const dbMsg = chalk.bgYellow.bold.green(message);
        console.log(dbMsg, db._appliedParent._activeProvider)
    } catch (error) {
        const message = 'Database connection error';
        const dbMsg = chalk.bgYellow.bold.red(message);
        console.log(dbMsg, error)
    }

    const message = 'Server succesfully run in port';
    const serverMsg = chalk.bgYellow.bold.green(message);
    console.log(`${serverMsg} ${DB_HOST}:${PORT}`)
})