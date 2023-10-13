const bookModel = require('./bookModel');
const genreModel = require('../Genres/genresModel');
const { exists } = require('./bookModel');
const { default: mongoose } = require('mongoose');

class Book{

    async addBook(data){
        try {
    
            let userData = await bookModel.create(data);
            return userData;

        } catch (error) {
            return error;
        }
    }

    async  getBooks(genre){
        try {

            console.log("-----------genre------------------", genre)

            let existsGenre = await genreModel.findOne({type:genre});
           
            if(!existsGenre) return { message:`${genre} genre doesn't exists`}

            let bookData = await bookModel.find();
            return bookData;
            
        } catch (error) {
           return error 
        }
    }
}

module.exports = Book;