import express from 'express';
import UserControllers from '../controllers/userControllers.js';
import checkUserAuth from '../middleware/authmiddleware.js';
const router = express.Router();

// route level middleware

router.use('/changepassword', checkUserAuth)
router.use('/loggeduser', checkUserAuth)




// public routes 
router.post('/register', UserControllers.userRegistration);
router.post('/login', UserControllers.userLogin);
router.post('/send-reset-password-email', UserControllers.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token', UserControllers.userPasswordReset);

//protected routes
router.post('/changepassword', UserControllers.changeUserPassword);
router.get('/loggeduser', UserControllers.loggedUser);



export default router;