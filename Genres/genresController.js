const genreModel = require('./genresModel');

class Genre{

    async addGenres(type){
        try {
    
            const data = await genreModel.create({type:type});
            return data;

        } catch (error) {
           return error 
        }
    }

    async getData(){
        try {
            
            let data = await genreModel.find();
            return data;

        } catch (error) {
            return error;
        }
    }
}

module.exports = Genre;