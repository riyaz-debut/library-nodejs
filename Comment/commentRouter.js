const express = require('express');
const router = express.Router();
const checkAuth = require('../Middleware/auth');
const Comment = require('./commentController');
const {post,get,put,validate}= require("../Validation/commentValidation");

// add comment on movies/tv shows
router.post('/',post(), validate, checkAuth, async(req,res)=> {
    try {
            let data = {
                type: parseInt(req.query.type),
                comment : req.body.comment,
                user_id : req.data._id,
                reference_id : req.body.reference_id,
            }

            let comment = new Comment();
            let result = await comment.addComment(data);
            res.status(200).json({status:1,message:'Success', data :result});
        
    } catch (error) {
        res.status(500).json({status:0, message:error.message, data :null});
    }
})

// edit comment 
router.put('/:id',put(), validate, checkAuth,async(req,res)=> {
    try {
        let id = req.params.id;
        let data = {
            comment : req.body.comment,
            user_id : req.data._id,
        }

        let comment = new Comment();
        let result = await comment.editComment(id,data);

        if(!result){
            res.status(401).json({status:0,message:'Invalid request', data:null})  
        }else{
            res.status(200).json({status:1,message:'Success', data :result});
        }

    } catch (error) {
        res.status(500).json({status:0, message:error.message, data :null});
    }
})

// soft delete comment
router.delete('/:id',checkAuth,async (req,res)=> {
    try {
            let id = req.params.id;
            let user_id = req.data._id;
            
            let comment = new Comment();
            let result = await comment.delComment(id,user_id);
            if(!result){
                res.status(401).json({status:0,message:'Invalid request', data:null})  
            }else{
                res.status(200).json({ status:1, message:"comment deleted Successfully"})
            }
        
    } catch (error) {
        res.status(500).json({status:0, message:error.message, data :null});
    }
})

// get list of all commnents on an movie/tv show
router.get("/", get(), validate, checkAuth,async(req,res)=> {
    try {
            let id = req.query.reference_id;
            let page = req.query.page;
            
            let comment = new Comment();
            let result = await comment.getComment(id,page);

            if(result == ''){
                res.status(400).json({ status:0, message:'Invalid request'})
            }else{
                res.status(200).json({ status:1, message:"Success", data :result})
            }

    } catch (error) {
        res.status(500).json({status:0, message:error.message, data :null});
    }
})












module.exports = router;