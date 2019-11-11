const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const User=require("../models/user");
const Verificationtoken=require("../models/tokenverification");
const jwt=require("jsonwebtoken");
const usercontroller=require("../controllers/user");



router.post('/signup',usercontroller.user_signup);
router.post('/login',usercontroller.user_login);
router.delete("/:userId",usercontroller.user_delete);
router.get("/viewposts",usercontroller.user_view);

router.get('/confirmation/:token', usercontroller.confirmationPost);
router.post('/resend', usercontroller.resendTokenPost);
module.exports=router;
