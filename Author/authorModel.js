const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    name:{type:String,required:true},
    address:{type:String,default:''},
    phoneno:{type:Number,required:true},

},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("author", authorSchema);