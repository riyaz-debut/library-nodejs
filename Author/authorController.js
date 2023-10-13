const authorModel = require('./authorModel');

class Author{

    async createUser(data){
        try {

            let userData = await authorModel.create(data);
            return userData; 

        } catch (error) {
            return error
        }

    }

    async getData(){
        try {
            
            let userData = await authorModel.find();
            return userData;
            
        } catch (error) {
            return error
        }
    }
} 

module.exports = Author;