const express = require('express');
const router = express.Router();
const Bookmark = require('./bookmarkController');
const checkAuth = require('../Middleware/auth');
const {post,get,validate}= require('../Validation/bookmarkValidate');

// bookmark movie $tv shows
router.post('/', post(),validate,checkAuth, async(req,res)=> {
    try {
        let data ={ 
            type : parseInt(req.query.type),
            status: req.body.status,
            user_id: req.data._id,
            reference_id : req.body.reference_id,
        }

        let post = new Bookmark();
        let result = await post.addBookmark(data);

        res.status(200).json({status:1, message:'Success', data:result})
        
    } catch (error) {
        res.status(500).json({status:0,message:error.message,data:null})
    }
})

// get the bookmark list by user
router.get('/',get(),validate, checkAuth,async(req,res)=> {
    try {
        let id = req.data._id;
        let page = req.query.page;

        let get = new Bookmark();
        let result = await get.getBookmark(id,page);

        if(result == ''){
            res.status(400).json({status:0, message:'Invalid request'})
        }else{
            res.status(200).json({status:1,message:'Success',data:result});
        }
        
    } catch (error) {
        res.status(500).json({status:0 , message:error.message, data:null})
    }

})

// soft delete the bookmark
router.delete('/:id',checkAuth,async(req,res)=> {
    try {
            let id = req.params.id;
            let user_id = req.data._id;

            let del = new Bookmark();
            let result = await del.deleteBookmark(id,user_id);

            if(!result){
                res.status(400).json({status:0, message:'Invalid request'})
            }else{
                res.status(200).json({status:1,message:'Soft deleted the bookmark'});
            }
        
    } catch (error) {
        res.status(500).json({status:0 , message:error.message, data:null})
    }
})




module.exports = router;