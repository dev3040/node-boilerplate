const mongoose = require("mongoose")
const config = require('../config/connection')
const statusCode = require("../config/statuscode")
const User = require("./../models/user")
const sendEmail = require("../helper/email")
const ForgotOtp = require('./../models/forgot_otp')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { response_data } = require("../helper/response")


// User registration
exports.userSign = (req, res, next) => {
    const confirm_token = jwt.sign({ email: req.body.email }, config.secretKey)
    User.find({email: req.body.email})
        .then(result => {
            if (result.length!=0) {
                if(result[0].status=="Active"){
                    return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Specified email is already in use" });
                }
                else if(result[0].status=="Pending")
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in user registration" });
                    }
                    else {
                        User.findOneAndUpdate({ email: result[0].email }, { confirmationCode: confirm_token, name: req.body.name, phone_no: req.body.phone_no, password: hash })
                            .then(result => {
                            })
                        sendEmail.sendtokenMail(req.body.name, req.body.email, confirm_token)
                        return response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "Please check your mail to verify your account", result: confirm_token });
                    }
                })
            }
        }).catch(err=>{
            console.log(err)
        })
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in user registration" });
        }
        else {
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                name: req.body.name,
                email: req.body.email,
                password: hash,
                role: 2,
                phone_no: req.body.phone_no,
                confirmationCode: confirm_token
            })
            user.save()
                .then(result => {
                    response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "User was registered successfully! Please check your email", result: result });
                    sendEmail.sendtokenMail(req.body.name, req.body.email, confirm_token)
                })
                .catch(err => {
                    response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: err.errors.email.message });
                })
        }
    })
}

// verify confirmation token 
exports.verifyUser = (req, res, next) => {
    User.findOne({
        confirmationCode: req.params.confirmationCode,
    })

        .then((user) => {
            if (!user) {
                return response_data({ res, statusCode: statusCode.NOTFOUND, success: 0, message: "User Not found." });
            }
            user.status = "Active";
            user.save((err) => {
                if (err) {
                    response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: err })
                    return;
                }
                else {
                    response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "User Authorized" })
                    return;
                }
            });
        })
        .catch((e) => console.log("error", e));
};

// User Login
exports.userLogin = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return response_data({ res, statusCode: statusCode.UNAUTHORIZED, success: 0, message: "User doesn't exist" });
            }
            if (user[0].status != "Active") {
                return response_data({ res, statusCode: statusCode.UNAUTHORIZED, success: 0, message: "Pending Account. Please Verify Your Email!" })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (!result) {
                    return response_data({ res, statusCode: statusCode.UNAUTHORIZED, success: 0, message: "Password doesn't match" });
                }
                if (result) {
                    const token = jwt.sign({
                        userId: user[0]._id,
                        name: user[0].name,
                        email: user[0].email,
                        role: user[0].role
                    },
                        config.tokenKey,
                        {
                            expiresIn: config.tokenExpiryTime,
                        }
                    )
                    user_data = {
                        id: user[0]._id,
                        name: user[0].name,
                        email: user[0].email,
                        phone_no: user[0].phone_no,
                        role: user[0].role,
                        token: token
                    }
                    response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "User logged successfully", result: user_data });
                }
            })
        })
        .catch(error => {
            response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in user login" });
        })
}

//  User update
exports.userUpdate = (req, res, next) => {
    let doc = {
        name: req.body.name,
        phone_no: req.body.phone_no
    }
    User.findOneAndUpdate({ _id: req.user._id }, {
        $set: doc
    })
        .then(result => {
            response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "User data updated Successfully", result: doc });
        })
        .catch(err => {
            response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "No such record available", error: err });
        })
}
// change Password...
exports.changePassword = (req, res, next) => {
    let new_hash_pass = bcrypt.hash(req.body.new_pass, 10, (err, hash) => {
        if (err) {
            return response_data({ res, statusCode: statusCode.NOTFOUND, success: 0, message: "Error in hashing", error: err });
        }
        else {
            new_hash_pass = hash
        }
    })
    User.findOne({ email: req.user.email })
        .then(result => {
            hash = result.password
            bcrypt.compare(req.body.old_pass, hash)
                .then(result => {
                    if (result == true) {
                        User.findByIdAndUpdate({ _id: req.user._id }, { $set: { password: new_hash_pass } }).select(['-password','-confirmationCode'])
                            .then(result => {
                                response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "Password updated Successfully,Please Login again", result: result });
                            })
                            .catch(err => {
                                response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "error", error: err });
                            })
                    }
                    else {
                        response_data({ res, statusCode: statusCode.NOTFOUND, success: 0, message: "Invalid old password" });
                    }
                })
                .catch(err => {
                    response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in requested data" });
                })
        })
}

// Two api for Forgot password
// start of forgot password

// Check mail and send otp if Email exist for forgot password
exports.forgotCheckMail = async (req, res, next) => {
    User.find({ email: req.body.email })
        .then(result => {
            if (result.length == 0) {
                response_data({ res, statusCode: statusCode.NOTFOUND, success: 0, message: "User doesn't exist" });
            }
            else {
                ForgotOtp.find({ email: req.body.email })
                    .then(result => {
                        if (result.length == 0) {
                            let otpcode = Math.floor(1000 + Math.random() * 9000);
                            let forgot_otpdata = new ForgotOtp({
                                _id: new mongoose.Types.ObjectId,
                                email: req.body.email,
                                code: otpcode
                            })
                            forgot_otpdata.save()
                                .then(async result => {
                                    let email_result = sendEmail.sendMail(req.body.email, otpcode)
                                    if (await email_result == true) {
                                        response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "OTP sent successfully", result: result });
                                    }
                                })
                                .catch(err => {
                                    response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in sending OTP", error: err });
                                    ForgotOtp.deleteOne({ email: req.body.email })
                                        .then(result => {
                                            console.log(result)
                                        })
                                })
                        }
                        else {
                            response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "Your old otp is still valid" });
                        }
                    })
                    .catch(err => {
                        response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error Occurs", error: err });
                    })
            }
        })
}

// To check forgot password otp matches or not
exports.forgotOtp = (req, res, next) => {
    ForgotOtp.find({ code: req.body.code })
        .then(result => {
            if (result.length == 0) {
                response_data({ res, statusCode: statusCode.BADREQUEST, success: 0, message: "Invalid OTP" });
            }
            else {
                bcrypt.hash(req.body.changed_pass, 10, (err, hash) => {
                    if (err) {
                        return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in hashing", error: err });
                    }
                    else {
                        User.findOneAndUpdate({ email: result[0].email }, { $set: { password: hash } }).select(['-password'])
                            .then(result => {
                                response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "Password Updated Successfully", result: result });
                            })
                            .catch(err => {
                                response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Error in updating data", error: err });
                            })
                    }
                })
            }
        })
        .catch(err => {
            response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "No such data available", error: err });
        })
}
// End of forgot password

// To verify token
exports.verify = async (req, res, next) => {
    try {
        let { token } = req.body
        const verifyUser = jwt.verify(token, config.tokenKey)
        let user = await User.findById(verifyUser.userId);
        if (!user) {
            response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Invalid Token", error: false });
        }
        response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: true, result: null });
    }
    catch (error) {
        response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Invalid Token", error: false });
    }
}

exports.getUser = async (req, res, next) => {
    try {
        let userData = await User.find()
        if (userData) {
            return response_data({ res, statusCode: statusCode.SUCCESS, success: 1, message: "List of Users", result: userData });
        }
        return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Users not found" });
    }
    catch (err) {
        return response_data({ res, statusCode: statusCode.SERVER_ERROR, success: 0, message: "Problem in listing Users", error: err });

    }


}