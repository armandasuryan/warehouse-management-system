import { config } from 'dotenv';
import express from 'express';
import db from './src/config/prisma.js';
import userRoutes from './src/routes/user.routes.js';

config()
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || localhost;

const app = express();
const version = '/wms/api/v1'
app.use(express.json());

app.use(`${version}`, userRoutes)

app.listen(PORT, async () => {
    try {
        await db.$connect();
        console.log('Database connection succesful from', db._appliedParent._activeProvider)
    } catch (error) {
        console.log('Database connection error :', error)
    }

    console.log(`Server succesfully run in port ${DB_HOST}:${PORT}`)
})