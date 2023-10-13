const express = require('express');
const router = express.Router();
const Model = require('./recommendationModel');
const Recommendation = require('./recommendationController');
const {post,put,get,validate} = require('../Validation/recoValidation');
const checkAuth = require('../Middleware/auth');

// add rating & review 
router.post('/',post(),validate, checkAuth ,async (req,res)=> {
    try {
            let data ={
                    type : parseInt(req.query.type),
                    rating: req.body.rating,
                    review :req.body.review,
                    reference_id: req.body.reference_id,                   // movies or tv show id
                    user_id:req.data._id

            }
            
            let rating = new Recommendation();

            let result = await rating.recommendation(data);
            res.status(200).json({ status:1, message:"Success", data :result})

    } catch (error) {
        res.status(500).json({ status:0, message:error.message, data:null})
    }
})


// edit rating & review 
router.put('/:id',put(),validate, checkAuth, async (req,res)=> {
    try {
            let id =req.params.id;
            let data = {
                rating: req.body.rating,
                review :req.body.review,
                user_id: req.data._id,
            }
            let rating = new Recommendation();

            let result = await rating.editRecommendation(id,data);
            if(!result){
                res.status(401).json({status:0,message:'Invalid request'})
            }else{
                res.status(200).json({ status:1, message:"Success", data :result})
            }
            
    } catch (error) {
            res.status(500).json({status:0, message:error.message,data:null})
    }
})

// soft delete the rating
router.delete("/:id",checkAuth,async (req,res)=> {
    try {
            let id =req.params.id;
            let user_id= req.data._id;
             
            let rating = new Recommendation();

            let result = await rating.deleteRecommendation(id,user_id);
            if(!result){
                res.status(401).json({status:0,message:'Invalid request'})  
            }else{
                res.status(200).json({ status:1, message:"rating deleted Successfully"})
            }
           
        
    } catch (error) {
        res.status(500).json({status:0, message:error.message,data:null})
    }
})

// get the list of all rating by user
router.get('/', get(),validate,checkAuth, async (req,res)=> {
    try {
            let id = req.data._id;
            let page = req.query.page;
            let rating = new Recommendation();

            let result = await rating.getRecommendation(id,page);
            if(result == ''){
                res.status(401).json({status:0,message:'Invalid request', data:null})  
            }else{
                res.status(200).json({status:1,message:'Success', data :result});
            }
    } catch (error) {
       res.status(501).json({status:0, message:error.message,data:null}) 
    }
})




module.exports = router;