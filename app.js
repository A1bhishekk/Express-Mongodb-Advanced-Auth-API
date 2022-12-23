import express from 'express';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';


const app = express();
app.use(cors());

config({
    path: './config/config.env'
});
const PORT = process.env.PORT || 5000;
connectDB(process.env.DATABASE_URL);


app.use(express.json());


// load all routes
app.use('/api/v1/user', userRoutes);



app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})