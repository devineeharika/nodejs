const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const User=require("../models/user");
const Farmer=require("../models/farmer");

const Agroexpert=require("../models/agroexpert");
var Token=require("../models/tokenverification");
const jwt=require("jsonwebtoken");
const express=require("express");
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var dotenv = require('dotenv');



const { verifyToken }= require('../middleware/check-auth');
exports.user_signup=(req,res,next) => {
    console.log('logging form user_signup function')
    User.find({email:req.body.email}).exec().then(user=>{
        if(user.length>=1)
        {
            return res.status(409).json({
                message:"Mail Exists"
            }
            )
           
        }else{

       
    
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err){
            return res.status(500).json({
                error:err
            });
        }else{
        
            const user=new User({
                _id:new mongoose.Types.ObjectId,
                username:req.body.username,
                mobilenumber:req.body.mobilenumber,
                email:req.body.email,
                password:hash,
                street:req.body.street,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                type:req.body.type,
            
            
        
    
        });
           user.save()
           
           .then(result =>{
            console.log("usercreated");
                                
                               
                                
           })
           .catch(err=>{
               console.log(err);
               res.status(500).json({
                   error:err
               });
           });
           if (req.body.type=="farmer"){
            const farmer=new Farmer({
                farmerid:user._id,
                latitude:req.body.latitude,
                longitude:req.body.longitude,
                
            })
               
            farmer.save()
            .then(result =>{
                console.log("farmercreated");
                                    
                                   
                                    
               })
               .catch(err=>{
                   console.log(err);
                   res.status(500).json({
                       error:err
                   });
               });  
        }
       else if (req.body.type=="agricultureexpert"){
            const agroexpert=new Agroexpert({
                agroexpertid:user._id,
                education:req.body.education

                
            })
               
             agroexpert.save()
            .then(result =>{
                console.log("agroexpertcreated");
                                    
                                   
                                    
               })
               .catch(err=>{
                   console.log(err);
                   res.status(500).json({
                       error:err
                   });
               });  
        }
           
        
        var verificationtoken = new Token({ _userId: user._id,
             verificationtoken: crypto.randomBytes(16).toString('hex') 
            });

        // Save the verification token
        verificationtoken.save(function (err) {
            
            if (err) {
                console.log("a");
                 return res.status(500).send({ msg: err.message });
                 }
        })
        link=`http://localhost:5000/users/confirmation/${verificationtoken.verificationtoken}`;
        
        var transporter = nodemailer.createTransport({ service: "gmail", auth: { user: 'neeharika149@gmail.com', pass: 'neeha@149' } });
            var mailOptions = { from: 'neeharika149@gmail.com', to: user.email, subject: 'Account Verification Token', 
            html : `Hello,<br> Please Click on the link to verify your email.<br><a href="${link}">${link}</a>`,}
            
            transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    console.log("b");
                     return res.status(500).send({ msg: err.message }); 
                    }
                res.status(200).send('A verification email has been sent to ' + user.email + '.');
            });
    }
    });
}
});
/************************************ */
}
exports.confirmationPost = function (req, res, next) {
    console.log("enters into verification function")
  

    // Find a matching token
    Token.findOne({ verificationtoken: req.params.token }, function (err, verificationtoken) {
        console.log(req.params.token)
        if (!verificationtoken) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

        // If we found a token, find a matching user
        User.findOne({ _id: verificationtoken._userId }, function (err, user) {
            console.log(user. _id,verificationtoken._userId )
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                return res.sendFile( "/soadproject/frontend/login.html", {'root': '../'});
            });
        });
    });
};

exports.resendTokenPost = function (req, res, next) {
    
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

        var verificationtoken = new Token({ _userId: user._id, verificationtoken: crypto.randomBytes(16).toString('hex') });

        // Save the token
        verificationtoken.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }

            // Send the email
            var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
            var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + verificationtoken.verificationtoken + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send('A verification email has been sent to ' + user.email + '.');
            });
        });

    });
};
exports.user_login=(req,res,next)=>{

    User.find({email:req.body.email})
    .exec()
    .then(
        user=>{
            if (user.length<1){
                return res.status(401).json({
                    message:"Auth failed"
                })
            }
            
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(err){
                    console.log("a");
                    return res.status(401).json({
                        message:"Auth failed"
                    }) 
                }
                if(result)
                      {
                       const token= jwt.sign({
                            email: user[0].email
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn:"1h"
                        }
                        );
                        
                         return res.status(200).header("authorization",token)
                         
                       } 
                    
                       res.status(401).json({
                          
                           message:"auth failed"
                    
                       })         
                      })
        }
    )
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
}
exports.option=(req,res)=>{
    return res.sendFile( "/soadproject/frontend/forgotpassword.html", {'root': '../'});


}
exports.user_view=(verifyToken ,(req, res) => {
    jwt.verify(req.token, process.env.Token_Secret, (err, authData) => {
        if(err) {
            res.status(401).json({Error_Message: 'Access Denied'});
        } else {
            res.json({message: 'asdfkljsdf'});
        }
    });
})
exports.user_logout=(req,res)=>{
    res.redirect('/users')
}


exports.user_delete=(req,res,next) => {
    User.remove({_id: req.params.userId}).exec()
    .then(result => {
        res.status(200).json({
           message:'User deleted'
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
}
