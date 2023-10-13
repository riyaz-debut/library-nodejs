const mongoose = require('mongoose');

const genreSchema = mongoose.Schema({
    type:{type:String,required:true}

},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('genre',genreSchema)