const express = require('express');
const router = express.Router();
const cookieparser = require('cookie-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const userModel = require('./userModel');
const User = require('./userController');
const initializePassport = require('../Middleware/passport');
const session = require('express-session');
const { userValidationRules,verify,userLogin,change,get,follow,unfollow,reset,validate }= require('../Validation/userValidation');
const checkAuth = require('../Middleware/auth');
const bcrypt = require('bcrypt');
const saltRounds =10;
const nodemailer = require('nodemailer')

router.use(
    session({
        secret: process.env.SECRET,
        resave:false,
        saveUninitialized:true
    })
)

router.use(cookieparser());
router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport);

//let refreshTokens = [];

// signup user
router.post("/signup", userValidationRules(), validate, async (req,res)=> {
    try {
        let foundUser = await userModel.findOne({email:req.body.email});
        if(foundUser) return res.status(403).json({status:0, message:"Email is Already in use "});

        let hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        let data = {
            firstName: req.body.firstName,
            lastName:req.body.lastName,
            email: req.body.email,
            password:hashPassword,
            address:req.body.address,
            language:req.body.language,
            phoneno:req.body.phoneno,

        }
    
        let user = new User();
        let result = await user.saveData(data);
        
        mail(data.email);
        res.status(200).json({status:1, message:" User signup Successfully", data:result });
        
    } catch (error) {
        console.log(error)
        res.status(404).json({status:0, message:'failed', error:error});
    }
})

// verifyotp
router.post("/verifyotp",verify(),validate, async (req,res)=> {
    try {
            let data ={
                    id:req.body.id,
                    otp:req.body.otp,
            }

            let user = new User();
            let result = await user.verifyOtp(data);

            if(!result){
                res.status(400).send({status:0,message:"Invalid request"})
            }else{
                res.status(200).send({status:1,message:result})
            }

    } catch (error) {
        res.status(404).send({status:0,message:'failed',error:error.message})
    }
})

// block user
router.put("/block/:id", async(req,res)=>{
    try {
        
        let id = req.params.id;
        let blocked = req.body.blocked;

        let block = new User();

        let result = await block.blockedUser(id,blocked);

        res.status(200).send({status:1,message:'Success',data:result})

    } catch (error) {
        res.status(400).send({status:0, message:'failed',error:error.message})
    }
})

// unblock user
router.put("/unblock/:id", async(req,res)=>{
    try {
        
        let id = req.params.id;
       
        let unblock = new User();

        let result = await unblock.unblockedUser(id);

        res.status(200).send({status:1,message:'Success',data:result})

    } catch (error) {
        res.status(400).send({status:0, message:'failed',error:error.message})
    }
})

// login user
router.post("/login",userLogin(),validate,passport.authenticate('local'), (req,res)=> {
    let data = {_id:req.user._id, email:req.user.email};
    let token = jwt.sign(data, process.env.SECRET_KEY,{expiresIn:process.env.TOKEN_lIFE });
    let refreshToken = jwt.sign(data, process.env.RE_SECRET_KEY,{expiresIn: process.env.RETOKEN_lIFE });
    
    //refreshTokens.push(refreshToken);
    res.cookie('jwt',refreshToken)                              // store in cookies
    res.status(200).json({status:1,message:"User login Successfully", data:{token:token,refreshToken:refreshToken}});
})

// facebook
router.get("/auth/facebook" ,passport.authenticate('facebook', {scope: ['public_profile', 'email']}));

router.get("/auth/facebook/callback",passport.authenticate('facebook',{
    successRedirect:"/",
    failureRedirect:"/fail",
})
);

// google
router.get('/auth/google',passport.authenticate('google',{
    scope:['email','profile']
}));

router.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect:"/",
    failureRedirect:"/fail",
}))

// twitter
router.get('/auth/twitter',passport.authenticate('twitter',{
    scope:'email',
}))

router.get('/auth/twitter/callback',passport.authenticate('twitter',{
    successRedirect:'/',
    failureRedirect:'/fail'

}))

router.get("/logout",(req,res)=> {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.render('logout');
      });
})

router.get("/fail",(req,res)=> {
    res.status(200).send('failed attempt')
})

router.get("/",(req,res)=> {
    res.render("success")
   
})



// get all users data
router.get("/profile/getData", async(req,res)=> {
try {
    let page = 1 ;
    let getUsers = new User();
    let result = await getUsers.getData( page);

    res.status(200).json({status:1, message:" Get all  users  Successfully", data:result});    
} catch (error) {
    res.status(404).json({status:0, message:'failed', error:error});
}

});

// get user by id
router.get("/profile/:id",checkAuth, async (req,res)=> {
    try {
        let _id = req.params.id;
        let getUser = new User();
        let result = await getUser.getDataById(_id);

        if(!result){
            res.status(422).json({status:0, message:'Invalid id'});   
        }else{
            res.status(200).json({status:1, message:" Get  user  Successfully", data:result}); 
        }  

    } catch (error) {
        console.log(error)
        res.status(404).json({status:0, message:'failed', error:error});
    }
})


// update user
router.put("/profile/:id", checkAuth, async (req,res)=> {
    try {
        let _id = req.params.id;
        let body = req.body;
        let updateUser = new User();

        let result = await updateUser.updateById(_id,body);

        if(!result){
            res.status(422).json({status:0, message:'Invalid id'});   
        }else{
            res.status(200).json({status:1, message:" User updated  Successfully", data:result}); 
        } 
        
    } catch (error) {
        console.log(error)
        res.status(404).json({status:0,message:'failed', error:error})
    }
})

// delete user
router.delete("/profile/:id", checkAuth, async (req,res)=> {
    try {
        let id = req.params.id;
        let deleteUser = new User();

        let result = await deleteUser.deleteUserById(id);
        res.status(200).send({status:1, message:'User deleted Successfully'});


    } catch (error) {
        console.log(error)
        res.status(404).json({status:0,message:'failed', error:error})
    }
})

// follow api 
router.post("/follow",follow(),validate, checkAuth, async(req,res)=> {
    try {
        let decodedData = req.data;                 //  decoded data of jwt token 
        let data =
        {
            id:req.body.id,
           follow: req.body.follow
        }
        
        let follow = new User();
        let result = await follow.followUser(data,decodedData);
        res.status(200).send({status:200, message:'you followed user successfully', data:result})
        
    } catch (error) {
        console.log(error)
       res.status(404).send({status:0,message:'failed', error:error}) 
    }
})

// unfollow api
router.post('/unfollow',unfollow(),validate, checkAuth, async(req,res)=> {
    try {
        let decodedData = req.data;                 //  decoded data of jwt token 
        let data =
        {
            id:req.body.id,
           unfollow: req.body.unfollow,
        }

        let unfollow = new User();
        let result = await unfollow.unfollowUser(data,decodedData);
        res.status(200).send({status:200, message:'you unfollowed user successfully', data:result})
        
    } catch (error) {
        console.log(error)
        res.status(404).send({status:0,message:'failed', error:error}) 
    }
})

// get user follower ,following count and data
router.get('/userData/:id',checkAuth, async(req,res)=> {
    try {
        let _id = req.params.id;
        let getUserData = new User();

        let result = await getUserData.getUserData(_id);
        res.status(200).send({status:1, message:" Get  user follower and following  Successfully", data:result}); 
        
    } catch (error) {
        res.status(404).send({status:0,message:'failed', error:error}) 
    }
})

// get the following list of user 
router.get('/following', get(), validate,checkAuth, async(req,res)=> {
    try {
        let _id = req.data._id;
        let pageNo = parseInt(req.query.page);
        
        let getFollowing = new User();
        let result = await getFollowing.getFollowingList(_id, pageNo);

        res.status(200).send({status:1, message:'get the following list of user', following_list :result});

    } catch (error) {
        res.status(400).send({status:0, message:'failed', error:error});

    }
})

// get the follower list of user
router.get('/follower', get(), validate,checkAuth,async(req,res)=> {
    try {
        let _id = req.data._id;
        let pageNo = parseInt(req.query.page);

        let getFollower = new User();
        let result = await getFollower.getFollowerList(_id,pageNo);

        res.status(200).send({status:1, message:'get the follower list of user', follower_list:result});
        
    } catch (error) {
        res.status(400).send({status:0,message:'failed', error:error});
    }
})

// create access token throw refresh token 
router.post("/refreshToken",async(req,res)=> {
    try {
        
       // let refreshToken = req.headers.authorization;
        let refreshToken = req.cookies.jwt;

        if(refreshToken ==''){
            res.status(404).json({Message:"// please enter access token "})
        }else{
            let decoded = await jwt.verify(refreshToken,process.env.RE_SECRET_KEY);
            const {email,id} = decoded;

            const accessToken = await jwt.sign({email,id},process.env.SECRET_KEY,{expiresIn:process.env.TOKEN_lIFE });

            res.status(200).json({status:1, message:"Success", accessToken:accessToken})
        }

    } catch (error) {
      res.status(501).json({status:0,message:"Invalid token", data:null})  
    }
})

function mail(email){
    let transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user:"e912b0fc371661",
          pass:"b0d4a13aed043f"
        },

      });
     let mailOptions = {
        from: "chetanjot.singh@debutinfotech.com",
        to: email,
        subject: 'Sending Email using Node.js',
        text: 'Welcome Welcome you have successfully signup!!!'
      };
    
    
      transport.sendMail(mailOptions, (err, info)=> {
        if(err){
            console.log(err)
        }else{
            console.log("Email sent :", info.response);
        }
      })
    
    
}

// change password
router.post("/changePassword",change(), validate,checkAuth, async(req,res)=> {
    try {
            let data ={
                email: req.body.email,
                password:req.body.password,
                user_id: req.data._id

            }

            let change = new User();
            let result = await change.changePassword(data);

            res.status(200).json({status:1, message:'Password changed Successfully'})
        
    } catch (error) {
        console.log(error)
        res.status(400).json({status:0,message:error.message})
    }
})


router.post("/forgetPassword" , async(req,res)=> {
    try {
        
        const email = req.body.email;

        let forget = new User();

        let result = await forget.forgetPassword(email);

        res.status(200).json({status:1, message:'Link send to your mail ,please copy the link !!'})

    } catch (error) {
        console.log(error)
        res.status(400).json({status:0,message:error.message})
    }
})

router.post("/resetPassword",reset(), validate, async(req,res)=> {
    try {

        let token = req.query.token;
        let password = req.body.password;

        let rest = new User();

        let result = await rest.restPassword(token,password);

        res.status(200).json({status:1, message:'Reset Password Successfully'})
        
    } catch (error) {
        console.log(error)
        res.status(400).json({status:0,message:error.message})
    }
})

 

module.exports = router;