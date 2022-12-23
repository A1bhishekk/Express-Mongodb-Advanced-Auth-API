import express from 'express';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';


const app = express();
app.use(cors());

config({
    path: './.env'
});
const PORT = process.env.PORT || 5000;
connectDB(process.env.DATABASE_URL);


app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body{
                background-color: #000;
                color: aqua;
            }   
        </style>
    </head>
    <body>
        <h1>Api is working</h1>
        
    </body>
    </html>`)
})
// load all routes
app.use('/api/v1/user', userRoutes);



app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})