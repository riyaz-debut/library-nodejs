const mongoose = require('mongoose');

const likesSchema = mongoose.Schema({
    type:{ type:Number},                         // type 1 for movies & 2 for tv shows
    like:{type:Number,default:0},
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    reference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'movies' },
    is_deleted: { type: Number, default: 0 },
      
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("likes", likesSchema);