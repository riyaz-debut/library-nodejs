const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, match: /^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i },
    password:{type:String, required:true},
    phoneno:{type:Number, required:true},
    address:{type:String,required:true},
    language: { type: String, default: "english" },
    follow:[{ type: mongoose.Schema.Types.ObjectId , default:''}],
    following:[{ type: mongoose.Schema.Types.ObjectId , default:''}],
   token:{type:String, default:''},
   otp:{type:String,default:''},
   blocked:{type:Number,default:0},
   google_id:{type:String},                                                           // google id
   fb_id:{type:String},                                                           // fb id
   profile_pic:{type:String},                                                          // google,facebook profile pic
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("user", userSchema);