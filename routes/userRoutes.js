import express from 'express';
import UserControllers from '../controllers/userControllers.js';
const router = express.Router();


// public routes 
router.post('/register', UserControllers.userRegistration);
router.post('/login', UserControllers.userLogin);



export default router;