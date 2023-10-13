const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    name:{type:String, required:true},
    price:{type:Number,required:true},
    language:{type:String, default:'english'},
    author:{type:mongoose.Schema.Types.ObjectId,ref:'authors'},
    genre:{type:mongoose.Schema.Types.ObjectId,ref:'genres'},

},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })


module.exports = mongoose.model('book',bookSchema);