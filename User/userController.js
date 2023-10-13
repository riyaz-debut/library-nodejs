const userModel = require('./userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds =10;
const config = require('../config')
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const accountSid = config.TWILIO_ACCOUNT_SID; 
const authToken = config.TWILIO_AUTH_TOKEN;  
const client = require('twilio')(accountSid,authToken);

class User {

    // function for hashpassword
    async securePassword(password){
        let hash = await bcrypt.hash(password,saltRounds)
        return hash;

    }

    // function for send mail for change password

    async mail(email,password){
    let transport = nodemailer.createTransport({
        host: config.HOST,
        port: config.EPORT,
        auth: {
          user:config.EMAIL,
          pass:config.PASSWORD
        },

      });
     let mailOptions = {
        from: config.from,
        to: email,
        subject: 'Changed password',
        text: `changed password successfully!!  your password ${password}`
      };
    
    
      transport.sendMail(mailOptions, (err, info)=> {
        if(err){
            console.log(err)
        }else{
            console.log("Email sent :", info.response);
        }
      })
    
    
    }

    // function  send mail for forget password
    
    async forgetPasswordMail(name,email,token){
        let transport = nodemailer.createTransport({
            host: config.HOST,
            port: config.EPORT,
            auth: {
              user:config.EMAIL,
              pass:config.PASSWORD
            },
    
          });
         let mailOptions = {
            from:config.from,
            to: email,
            subject: 'Forget Password',
            html:'<p> Hi '+name+',Please copy the link and <a href="http://localhost:5000/resetPassword?token='+token+'">rest your password </a></p>'
          };
        
        
          transport.sendMail(mailOptions, (err, info)=> {
            if(err){
                console.log(err)
            }else{
                console.log("Email sent :", info.response);
            }
          })
        
        
        }

    async saveData(data){
        const payload ={firstName:data.firstName,lastName:data.lastName,email:data.email,address:data.address};
        const token = jwt.sign(payload, process.env.SECRET_KEY,{expiresIn:"24h"} );          // create token

        let fullname= data.firstName+" "+data.lastName;
        let otp = Math.random().toString().substring(2,8);                                  //create 6 digit otp
        data.otp = otp

        let userData = await userModel.create(data);                                     // store data in db                                                             //send token as response
                                    
        // await client.messages.create({                                                      // msg sent to number
        //     body:`hi ${fullname} Please enter this otp for verfication:${otp}`,
        //     from:config.number,
        //     to: data.phoneno,
        // }) .then(message => console.log("msg sent to phone no message id:",message.sid));
        
        return {userData ,token};

    }

    async blockedUser(id,blocked){
        try {

            let userData = await userModel.findByIdAndUpdate({_id:id},{blocked:blocked},{new:true});
            return userData
            
        } catch (error) {
            return Promise.reject({message:'Something went wrong'})
        }
    }

    async unblockedUser(id){
        try {

            let userData = await userModel.findByIdAndUpdate({_id:id},{blocked:0},{new:true});
            return userData
            
        } catch (error) {
            return Promise.reject({message:'Something went wrong'})
        }
    }

    async verifyOtp(data){
        try {
            let msg;
            let userData = await userModel.findById(data.id);
            console.log(userData)

            if(!userData){
                return Promise.reject({message:"User not found"})
            }

            if(userData.otp == ''){
                return Promise.reject({message:"resend otp"})
            }

            if(userData.otp !== data.otp){
                 return Promise.reject({message:"Invalid otp"})
            }else{
                let date = new Date();
                let time = date-userData.created_at;

                let seconds = 80000;
                if(time>seconds) return msg = "otp time expire please resend otp "

                let update = await userModel.findByIdAndUpdate({_id:data.id},{otp:''},{new:true})
                msg = "Your otp is verified Welcome to my web app "
                return msg;
            }

        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong'})
        }
    }

    async verifyUserEmail(email){
        let data = await userModel.findOne({email:email});
        return data; 
    }

    async getData(page){

        let pageSize = 10; 
        let skip = (page-1) * pageSize; 
        const projection = {firstName:1, lastName:1,email:1, address:1, language:1, _id:0}
        let data = await userModel.find().select(projection).limit(pageSize).skip(skip);
        return data;
    }

    async getDataById(_id){
        const projection = {firstName:1, lastName:1, address:1, language:1, _id:0}
        let data = await userModel.findById(_id).select(projection);
        return data;
    }

    async updateById(id,body){
       
        let data = await userModel.findByIdAndUpdate(id,body,{new:true});
        return data;
      
    }


    async deleteUserById(id){
        let data = await userModel.deleteOne({_id:id});
        return;
    }

    async followUser(data,decodedData){
        try {

            if(decodedData._id === data.id){                                          // not follow my own profile
                return Promise.reject({status:400,message:'This is my profile'})
            }else{
                let exitUser = await userModel.findById({_id:data.id});                // find user profile with id
                if(!exitUser){
                    return Promise.reject({status:404,message:"User not found"})
                }else{
                    let exitId = exitUser.follow;
                                                                                     // check  if user already followed 
                    for(let i=0;i<exitId.length;i++){
                        if(exitId[i].toString() == decodedData._id) return Promise.reject({status:400, message:'You have already followed user'});
                    }
                   

                    let followData = await userModel.findByIdAndUpdate({_id:data.id},{$push:{follow:decodedData._id}},{new:true});              // follow the user
                    let followingData = await userModel.findByIdAndUpdate({_id:decodedData._id},{$push:{following:data.id}},{new:true});        // following the user 
                    return followData;
                }
            }

        } catch (error) {
            console.log(error)
            return Promise.reject({status:400,message:'Something went wrong', error:error})
        }
      
    }


    async unfollowUser(data,decodedData){
        try {

            if(decodedData._id === data.id){                                   // not unfollow my own profile
                return Promise.reject({status:400,message:'This is my profile'})

            }else{
                let exitUser = await userModel.findById({_id:data.id});        // find user profile with id
                if(!exitUser){
                    return Promise.reject({status:404,message:"User not found"})
                }else{
                    let unfollowData = await userModel.findByIdAndUpdate({_id:data.id},{$pull:{follow:decodedData._id}},{new:true});
                    let followingData = await userModel.findByIdAndUpdate({_id:decodedData._id},{$pull:{following:data.id}},{new:true});
                    return unfollowData;
                }
            }
        } catch (error) {
            return Promise.reject({status:400,message:'Something went wrong', error:error})
        }
    }

    async getUserData(_id){
        try {
            const projection = {firstName:1, lastName:1, address:1, follow:1,following:1, _id:0}
            let userData = await userModel.findById(_id).select(projection);
            
            let followCount = userData.follow.length;                                       // get the count of follow and following user
            let followingCount = userData.following.length;
            let followUserData = await userModel.find({_id:{$in:userData.follow}}).select({firstName:1,lastName:1,_id:0})              // get the userdata throw follow id 
            let followingUserData = await userModel.find({_id:{$in:userData.following}}).select({firstName:1,lastName:1,_id:0})         // get the userdata throw following id
            return {userData, followCount , followingCount,followUserData,followingUserData};

        } catch (error) {
            console.log(error)
            return Promise.reject({status:400,message:'Something went wrong', error:error})
        }
    }

    async getFollowingList(_id,page){
        try {

            let followingData = await userModel.findById({_id:_id});            //get data by id
            let followingList = followingData.following ;                      // get following list
           
            let pageSize = 10; 
            let skip = (page-1) * pageSize; 
            const projection = {firstName:1, lastName:1, address:1, language:1, _id:0}
            let result = await userModel.find({_id:{$in:followingList}}).select(projection).limit(pageSize).skip(skip)
         
            return result;

            
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0, message:'Something went wrong', error:error});
        }
    }

    async getFollowerList(_id,page){
        try {
            let followerData = await userModel.findById({_id:_id});                 // get data by id
            let followerList = followerData.follow;                             // get follower list

            let pageSize = 10; 
            let skip = (page-1) * pageSize; 
            const projection = {firstName:1, lastName:1, address:1, language:1, _id:0}
            let result = await userModel.find({_id:{$in:followerList}}).select(projection).limit(pageSize).skip(skip)
         
         
            return result ;

        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong',error:error})
        }
    }

    async changePassword(data){ 
          try{
            let exit = await userModel.findOne({email:data.email, _id:data.user_id});

            if(exit){

                let hashPassword = await this.securePassword(data.password);

                let userData = await userModel.findByIdAndUpdate({ _id:data.user_id},{$set:{password:hashPassword}});

                if(userData){
                    let send = await this.mail(data.email,data.password);
                    return ;
                }else{
                    return Promise.reject({ status:0, message:"Invalid credentials"})
                }
            

            }else{
                return Promise.reject({status:0, message:"Invalid request try again "})
            }

            
            
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong',error:error})
        }
    }

    async forgetPassword(email){
    try {

        if(email == null) return Promise.reject({ message:'Please enter email'})

        let exit = await userModel.findOne({email:email});                      // check find user by email

        if(exit){
            let name = exit.firstName+ " "+ exit.lastName;
           
            let randomString = randomstring.generate();                             // generate ramdom string

            let data = await userModel.findOneAndUpdate({email:email},{$set:{token:randomString}});         // update in db
            let mail = await this.forgetPasswordMail(name,exit.email,randomString) ;
            return;
        }else{
            return Promise.reject({message:"This email doesn't exit "})
        }

    } catch (error) {
        return Promise.reject({status:0,message:'Something went wrong'})
        
    }
       
    }

    async restPassword(token,password){
        try {
            
            let tokenData = await userModel.findOne({token:token});

            if(tokenData){
                let hashPassword = await this.securePassword(password);

                let userData = await userModel.findByIdAndUpdate({_id:tokenData._id},{password:hashPassword, token:''}, {new:true});
                return userData;

            }else{
                return Promise.reject({message:'Invalid token try again'})
            }

        } catch (error) {
            console.log(error)
            return Promise.reject({message:"Something went wrong"})
        }
    }
}



module.exports = User ;
