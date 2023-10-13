const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportFacebook = require("passport-facebook").Strategy;
const passportGoogle = require('passport-google-oauth2').Strategy;
const passportTwitter = require('passport-twitter').Strategy;
const userModel = require('../User/userModel');
const User = require('../User/userController');
const bcrypt = require('bcrypt');
const  config  = require('../config')

function initialize(passport){
    const authenticateUser = async (email,password,done)=> {

        let login = new User();
        let user = await login.verifyUserEmail(email);

        if(user == null){                                                           // check email
            return done(null,false,{Message:"No user with this email"});
        }
        try {
            if(await bcrypt.compare(password,user.password)) {                      // compare password
                return done(null,user);
            }else{
                return done(null,false, {Message:" Incorrect password"})
            }
            
        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({usernameField:'email',passwordField:'password'},authenticateUser));

    passport.serializeUser((user,done)=> {
        if(user)   return done(null , user.id);
         return done(null, false);

    })

    passport.deserializeUser((id,done)=> {
        userModel.findById(id, (err,user)=> {
            if(err) return done (null,false);
            return done(null,user);
            
        })
    })

    // facebook strategy  
    passport.use(new passportFacebook({
        clientID :config.Facebook_App_Id,
        clientSecret:config.Facebook_App_Secret,
        callbackURL: config.Facebook_Url,
        profileFields: ['id','name', 'displayName', 'picture.type(large)', 'email']
    },
     async function(accessToken,refreshToken,profile,done){

        let userData  = {
            fb_id:profile._json.id,
            firstName:profile._json.first_name,                                               // data from google
            lastName:profile._json.last_name,
            email:profile._json.email,
            profile_pic:profile.photos[0].value,
            address:"rajpura",
            password:"444444444444",
            phoneno:"8146028388"
        }

        let existData = await userModel.findOne({fb_id:profile._json.id});              // if already in db 

        if(!existData) {
            let data = await userModel.create(userData);                                   // save in db
        }
       
        return done (null,profile)
     }

    ))


    // google strategy
    passport.use(new passportGoogle({
        clientID: config.Google_App_Id,
        clientSecret: config.Google_App_Secret,
        callbackURL: config.Google_Url,
        passReqToCallback: true
    },

    async function(request,accessToken,refreshToken,profile,done){
    
        let userData  ={
            google_id:profile.id,
            firstName:profile.given_name,                                               // data from google
            lastName:profile.family_name,
            email:profile.email,
            profile_pic:profile.picture,
            address:"rajpura",
            password:"444444444444",
            phoneno:"8146028388"


        }
        let existData = await userModel.findOne({google_id:profile.id});        // if already in db

        if(!existData){
            let data = await userModel.create(userData);                        // save in db
        }
        return done(null,profile)
    }
    ) )

    // twitter strategy
    passport.use(new passportTwitter({
        consumerKey :config.Twitter_App_Id,
        consumerSecret:config.Twitter_App_Secret,
        callbackURL: config.Twitter_Url,
    },
    
    async function(accessToken, refreshToken, profile, done) {
        console.log(profile)
        return done(null, profile);
      }

    ))
    
}



module.exports = initialize;