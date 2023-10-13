const Model = require('./recommendationModel');
const movieModel = require('../Movies/moviesModel');
const mongoose = require('mongoose');


class Recommendation{
    async recommendation(data){
            try {       
                                                                        // check for rating
                    if(data.rating>10||data.rating<1){
                            return Promise.reject({message:'please enter rating in between 1 to 10'})
                    }
                                                                        // check for if movie doesn't exit
                    let movieExit = await movieModel.findOne({_id:data.reference_id});
                    if(!movieExit){
                        return Promise.reject({message:'This reference_id does not exit'})
                    }
                                                                                // check for if already rated
                    let exitRating = await Model.findOne({user_id:data.user_id, reference_id:data.reference_id,is_deleted:0});
                    if(exitRating!== null) return Promise.reject({message:'you have already Rated & review'})

                    let  save =  await Model.create(data);                                        // save recommendation data in db
                
                    let result = await Model.aggregate([
                    {
                        $match: { _id:mongoose.Types.ObjectId(save._id) }
                    },
                    {
                        '$lookup':{
                                 from:"users",
                                 let:{ref_id:'$user_id'},
                                 pipeline:[
                                    {
                                        $match:{
                                            $expr:{
                                                    $eq:['$_id','$$ref_id']
                                            }
                                        }
                                    },
                                    {'$project':{firstName:1, lastName:1, email:1}}
                                 ],
                                 as:"userData"
                                 
                        }
                    },
                    {$unwind:'$userData'},
                    {
                        '$lookup':{
                                 from:"movies",
                                 let:{ref_id:'$reference_id'},
                                 pipeline:[
                                    {
                                        $match:{
                                            $expr:{
                                                    $eq:['$_id','$$ref_id']
                                            }
                                        }
                                    },
                                    {'$project':{title:1, name:1, release_date:1, type:1, original_language:1}}
                                 ],
                                 as:"itemData"
                                 
                        }
                    },
                    {$unwind:'$itemData'},
                    {
                        $project:{
                                type:1,
                                rating:1,
                                review:1,
                                userData:1,
                                itemData:1,
                        }
                    }
        
                ])

                return result;                                                              // send response

            } catch (error) {
                console.log(error)
            return  Promise.reject({status:400, message:'Something went wrong'})
            }
    }

    async editRecommendation(id,data){
        try {
                if(id.trim() ===''){                                                // if rating id is empty
                    return Promise.reject({message:'please enter the rating id'})
                }

                let result = await Model.findOneAndUpdate({_id:id,user_id:data.user_id, is_deleted:0},data,{new:true})      // update the rating & review
                return result;
        } catch (error) {
                return Promise.reject({status:400,message:'Something went wrong'})
        }
    }

    async deleteRecommendation(id,user_id){
        try {
                if(id.trim() ===''){                                                // if rating id is empty
                    return Promise.reject({message:'please enter the rating id'})
                }
                let result = await Model.findOneAndUpdate({_id:id,user_id:user_id, is_deleted:0},{is_deleted:1})
                return result;
                
        } catch (error) {
            return Promise.reject({status:400,message:'Something went wrong'})
        }
    }

    async getRecommendation(id,page){
        try {
             let pageSize = 10; 

              let result = await Model.aggregate([  
                {
                    $match:{user_id:mongoose.Types.ObjectId(id),is_deleted:0},
                    
                },
                {
                    "$lookup":{
                        from:"movies",
                        let:{ref_id:'$reference_id'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                            $eq:["$_id","$$ref_id"],
                                    }
                                }
                            },
                            {'$project':{title:1, name:1, type:1, release_date:1,  original_language:1 }}
                        ],
                        as:"itemData"
                    }
                },
                {   $unwind: "$itemData"},
                {
                    '$lookup':{
                             from:"users",
                             let:{ref_id:'$user_id'},
                             pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                                $eq:['$_id','$$ref_id']
                                        }
                                    }
                                },
                                {'$project':{firstName:1, lastName:1, email:1, }}
                             ],
                             as:"userData"
                             
                    }
                },
                {$unwind:'$userData'},
                {
                    $addFields:{
                        'itemData.RecommendationId':'$_id',
                        'itemData.rating':'$rating',
                        'itemData.review':'$review',
                    }
                },
                {   $skip : (page - 1) * pageSize},
                {   $limit : pageSize }, 
                {
                    $project:{
                             itemData:1,
                             userData:1
                     }
                }, 
                {
                    $group:{
                        _id:'$userData._id',
                        firstName:{$first : "$userData.firstName"} ,
                        lastName :{$first: "$userData.lastName"} ,
                        email :{$first: "$userData.email"} ,
                        itemData:{$push:'$itemData'},
                        count:{$sum:1},
                    }
                }    
              ])
    
                return result;
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong'})
        }
    }
}

module.exports = Recommendation