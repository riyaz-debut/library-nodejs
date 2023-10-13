const express = require('express');
const router = express.Router();
const likesModel = require('./likesModel');
const Likes = require('./likesController');
const checkAuth = require('../Middleware/auth');
const {post,get,validate}= require('../Validation/likeValidation');

// like movies & tv shows
router.post("/",post(), validate, checkAuth,async (req,res)=> {
    try {
        let data ={
            type:parseInt(req.query.type),
            like:req.body.like,
            reference_id: req.body.reference_id,                   // movies or tv show id
            user_id:req.data._id

        }

        let add = new Likes();

        let result = await add.addLikes(data);
        res.status(200).json({status:1, message:'success', data:result});
        
    } catch (error) {
        res.status(500).json({status:0,message:error.message, data : null})
    }
})

// soft delete the like 
router.delete('/:id', checkAuth, async (req,res)=> {
    try {
           let id  = req.params.id; 
           let user_id = req.data._id; 

           let like = new Likes();
           let result = await like.deleteLikes(id,user_id);

           if(!result){
            res.status(400).json({ status:0, message:'Invalid request'})
           }else{
            res.status(200).json({status:1,message:'like deleted Successfully'});
           }

    } catch (error) {
        res.status(500).json({status:0, message:error.message});
    }
})

// get the list of all users who liked movies & tv shows 
router.get('/', get(), validate,checkAuth, async(req,res)=> {
    try {
        let id = req.query.reference_id;
        let page = req.query.page;

        let like = new Likes();
        let result = await like.getLikes(id,page);

        if(result == ''){
            res.status(400).json({status:0, message:'Invalid request'})
        }else{
            res.status(200).json({status:1, message:'Success', data :result});
        }

    } catch (error) {
        res.status(500).json({status:0, message:error.message, data :null})
    }
})





module.exports = router;