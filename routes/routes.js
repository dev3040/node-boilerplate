const express = require('express')
const router = express.Router()
const paperwork = require("paperwork");
const controller = require('./../controllers')
const middleware=require('../middleware/auth')
const validation = require("./../validation");

router.post('/signup',paperwork.accept(validation.register.register), controller.user.userSign)
router.post('/login',paperwork.accept(validation.login.login),controller.user.userLogin)
router.put('/editUser',middleware,controller.user.userUpdate)
router.put('/changePassword', middleware, controller.user.changePassword)
router.post('/checkMail', controller.user.forgotCheckMail)
router.post('/forgotPassword', controller.user.forgotOtp)
router.post('/verifyUser',controller.user.verify)
router.get("/confirm/:confirmationCode", controller.user.verifyUser)
router.get("/getUsers",controller.user.getUser)

module.exports = router;
