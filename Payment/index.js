const express = require('express');
const config = require('../config');
const router = express.Router();
const publishable_key =config.publishable_key
const secret_Key = config.secret_key
const stripe = require('stripe')(secret_Key);


/* start */
// create customer
router.post('/', async(req,res)=> {
    try {  
        const customer = await stripe.customers.create({
            name:req.body.name,
            email:req.body.email,
        })

        res.status(200).send({status:1, data:customer});
    } catch (error) {
        console.log(error)
        res.status(400).send({status:0, message:error.message});
    }
})

// add new card 
router.post("/card", async (req,res)=> {
    try {
        
        const {customer_Id,card_Name, card_ExpYear, card_ExpMonth,card_Number,card_CVC}= req.body;

        const token = await stripe.tokens.create({                                      // create token using card detail
            card:{
                name:card_Name,
                number:card_Number,
                exp_month:card_ExpMonth,
                exp_year:card_ExpYear,
                cvc:card_CVC
            }
        })

        const card = await stripe.customers.createSource(customer_Id,{source:token.id});

        return res.status(200).send({status:1,card:card.id})

    } catch (error) {
        console.log(error);
        res.status(400).send({status:0,message:error.message});
    }
})

// create charges 
router.post("/charges", async (req,res)=> {
    try {
        const charge = await stripe.charges.create({
            receipt_email:'chetanjot.singh@debutinfotech.com',
            amount:req.body.amount,
            currency:"inr",
            card:req.body.card_Id,
            customer:req.body.customer_Id,
        })

        return res.status(200).send({status:1,data:charge})
    } catch (error) {
        console.log(error);
        res.status(400).send({ status:0, message:error.message})
    }
})

/* end */

// create payments
router.post("/intents", async(req,res)=> {
    try {

        const paymentMethod = await stripe.paymentMethods.create({
            type :'card',
            card:{

                number:req.body.card_no,
                exp_month:req.body.exp_month,
                exp_year:req.body.exp_year,
                cvc:req.body.cvc,
            },
            billing_details:{email:req.body.email},
        })

        const paymentIntents = await stripe.paymentIntents.create({
            payment_method:paymentMethod.id,
            amount:req.body.amount,
            currency:'inr',
            confirm:true,                           
            payment_method_types:['card']
        })

        res.status(200).send({status:1, data:paymentIntents})
        
    } catch (error) {
        console.log(error);
        res.status(400).send({status:0,message:error.message})
    }
})


module.exports = router;