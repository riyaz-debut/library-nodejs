const express = require('express');
const router = express.Router();
const Author = require('./authorController');
const {userValidation,validate} = require('../Validation/authorValidation')

const author = new Author(); 

// add author api
router.post('/',userValidation(),validate,async(req,res)=> {
    try {
            let data ={
                name:req.body.name,
                address:req.body.address,
                phoneno:req.body.phoneno,

            }

            let result = await author.createUser(data);
            res.status(200).send({status:1, message:'Success', data:result});

    } catch (error) {
        res.status(400).send({status:0, message:error.message,data:null})
    }
})


// get author
router.get("/",async(req,res)=> {
    try {
        
        let result = await author.getData();

        res.status(200).send({status:1, message:'Success', data:result})
    } catch (error) {
        res.status(400).send({status:0,message:error.message, data:null})
    }
})



module.exports =  router;