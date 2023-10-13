const express = require('express');
const router = express.Router();
const Book = require('./bookController');
const {create,validate} = require("../Validation/bookValidation")


// add book in store
router.post("/",create(),validate,async(req,res)=> {
    try {
        let data ={
            name:req.body.name,
            price:req.body.price,
            language:req.body.language,
            author:req.body.author,
            genre:req.body.genre
        }

        let result = await book.addBook(data);

        res.status(200).send({status:1, message:'Success', data:result})

    } catch (error) {
        res.status(400).send({status:0, message:error.message, data:null})
    }
})

// get book data by genre
router.get("/:genre", async (req,res)=> {
    try {
        
        let genre = req.params.genre.toLowerCase();
      
        let result = await book.getBooks(genre);

        res.status(200).send({status:1, message:'Success', data:result})

    } catch (error) {
        res.status(400).send({status:0, message:error.message, data:null})
    }
})





module.exports = router;