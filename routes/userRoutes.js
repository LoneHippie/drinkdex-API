const express = require('express');
const cors = require('cors');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(cors());

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//////// ALL ROUTES AFTER THIS MIDDLEWARE ARE PROTECTED //////////
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.route('/addDrink/:id')
    .patch(userController.addDrink);

router.route('/removeDrink/:id')
    .patch(userController.removeDrink);

//////// ALL BELOW ROUTES ARE AUTH PROTECTED AND RESTRICTED TO ADMIN ////////
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;