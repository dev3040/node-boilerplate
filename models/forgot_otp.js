const mongoose=require("mongoose")

const forgot_otpschema=new mongoose.Schema({
    _id:new mongoose.Schema.Types.ObjectId,
    email:String,
    code:String,
    
}, { timestamps: true })

forgot_otpschema.index({'createdAt': 1 }, { expireAfterSeconds: 120} );
module.exports=mongoose.model("ForgotOtp",forgot_otpschema)