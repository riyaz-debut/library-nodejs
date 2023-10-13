const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    id:{type:String,default:''},
    title:{type:String,default:''},
    original_language:{type:String,default:'en'},
    release_date:{type:Date},
    overview:{type:String},
    vote_average:{type:Number,default:0},
    vote_count:{type:Number,default:0},
    poster_path:{type:String,default:''},
    backdrop_path:{type:String,default:''},
    name:{type:String,default:''},
    type:{type:Number} ,                                 // 1:movies, 2:tv shows
    genre_ids:[{type:Object,default:[]}],
    tagline:{type:String,default:''},
    spoken_languages:[{type:Object,default:'en'}],
    revenue:{type:Number,default:''},
    status:{type:String,default:''},
    popularity:{type:Number,default:''},
    production_companies:[{type:Object,default:''}],
    production_countries:[{type:Object,default:''}],
    status_updated:{type:Number,default:0},
    date:{type:Date,default:''}
      
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model("movie", movieSchema);