const mongoose= require("mongoose")
const userschema=new mongoose.Schema({
     _id:mongoose.Schema.Types.ObjectId,
     name:{
         type:String
        },
     email: {
        type: String,
        required: [true, 'Please enter Email Address']
    },
    password:{
       type:String
    },
    phone_no:{
        type:String
    },
    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
      },
      confirmationCode: { 
        type: String, 
        unique: true },
    role:{
        type:Number
    }
},{ collection: 'user' })

module.exports=mongoose.model("User",userschema)