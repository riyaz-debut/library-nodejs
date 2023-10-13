const express = require('express');
const router = express.Router();
const Genre = require('./genresController');

const genre = new Genre();

// add genre
router.post("/", async(req,res)=> {
    try {
        
        let type = req.body.type.toLowerCase();

        let result = await genre.addGenres(type);

        res.status(200).send({status:1,message:'Success', data: result})
    } catch (error) {
      res.status(400).send({status:0,message:error.message,data:null})  
    }
})

// get genre
router.get("/",async(req,res)=> {
    try {
        
        let result = await genre.getData();

        res.status(200).send({status:1, message:'Success', data:result})
    } catch (error) {
        res.status(400).send({status:0,message:error.message, data:null})
    }
})



module.exports = router;