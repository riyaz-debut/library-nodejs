const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema({
    type:{ type:Number},                         // type 1 for movies & 2 for tv shows
    status:{type:Number,default:0},              // 1 for bookmark active or o for in active 
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    reference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'movies' },
      
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("bookmark", bookmarkSchema);