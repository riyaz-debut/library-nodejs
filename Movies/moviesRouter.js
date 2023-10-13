const express = require('express');
const router = express.Router();
const movieModel = require('./moviesModel');
const Movies = require('./moviesController');
const checkAuth = require('../Middleware/auth');
const {get,validate} = require('../Validation/moviesValidation');

// search movies & tv shows
router.get("/search/:text",get(),validate,checkAuth, async (req,res)=> {
    try {
        const text = req.params.text;
        let type = parseInt(req.query.type);                            // 1 for movies & 2 for tv shows

        let getMoviesTv = new Movies();

        let result = await getMoviesTv.getMoviesData(text,type);
        res.status(200).json({ status:1, message:"Success", data :result});
    } catch (error) {
        console.log(error)
        res.status(500).json({ status:0, message:'failed', data:null})
    }
})

// getdetails api for movies & tv shows 
router.get("/searchdata/:id",get(), validate, checkAuth, async(req,res)=> {
    try {
        let _id = req.params.id;
        let type = parseInt(req.query.type);  

        let getData = new Movies();
        
        let result = await getData.getDataById(type,_id);
        res.status(200).json({ status:1, message:"Success", data :result});
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ status:0, message:'failed', data:null})
    }
})



module.exports = router;