const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    type:{ type:Number},                         // type 1 for movies & 2 for tv shows
    comment:{type:String},
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    reference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'movies' },
    is_deleted: { type: Number, default: 0 },
      
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("comment", commentSchema);