const mongoose = require('mongoose');
const Model = require('./bookmarkModel');
const movieModel = require("../Movies/moviesModel");

class Bookmark{
    async addBookmark(data){
        try {
                                                                // check for if movie doesn't exit
            let movieExit = await movieModel.findOne({_id:data.reference_id});
            if(!movieExit){
                return Promise.reject({message:'This reference_id does not exit'})
            }

            let exit = await Model.findOne({user_id:data.user_id, reference_id:data.reference_id,status:1});
            if(exit !== null){
                return Promise.reject({message:'You have already bookmarked '})
            }

            let save = await Model.create(data);

            let result = await Model.aggregate([
                {$match:{_id:mongoose.Types.ObjectId(save._id)}},
                {
                    '$lookup':{
                        from:'movies',
                        let:{ref_id:'$reference_id'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$_id','$$ref_id']
                                    }
                                }
                            },
                            {'$project':{ title:1, name:1, type:1, release_date:1, overview:1, original_language:1 }}
                        ],
                        as:'itemData'

                    }
                },
                {$unwind:'$itemData'},
                {
                    '$lookup':{
                        from:'users',
                        let:{ref_id:'$user_id'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$_id','$$ref_id'],
                                    }
                                }
                            },
                            {'$project':{  firstName:1, lastName:1, email:1, address:1 }}
                        ],
                        as:'userData'

                    }
                },
                {$unwind:'$userData'},
                {
                    $project:{
                        type:1,
                        status:1,
                        itemData:1,
                        userData:1
                    }
                }
            ])

            return result;
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong'})
        }
    }

    async getBookmark(id,page){
        try {
            let pageSize = 10;

            let result = await Model.aggregate([
                {$match:{user_id:mongoose.Types.ObjectId(id),status:1}},
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
                                {'$project':{title:1, name:1,type:1, release_date:1, original_language:1}}
                             ],
                             as:"itemData"
                             
                    }
                },
                {$unwind:'$itemData'},
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
                         'itemData.bookmarkId':'$_id',
                         'itemData.status':'$status',
                    }
                },
                {
                    $project:{
                        userData:1,
                        itemData:1,
                    }
                },
                {   $skip:(page -1)* pageSize },
                {   $limit: pageSize },
                { $group : 
                    {
                        _id : "$userData._id" ,
                        firstName:{$first : "$userData.firstName"} ,
                        lastName :{$first: "$userData.lastName"} ,
                        email :{$first: "$userData.email"} ,
                        itemData:{$push:'$itemData'},
                        count:{$sum:1}
                    } 
                
                },
            ])

            return result;

        } catch (error) {
            console.log(error)
            return Promise.reject({status:0,message:'Something went wrong'})
        }
    }

    async deleteBookmark(id,user_id){
        try {
            if(id.trim() ===''){                                                // if rating id is empty
                return Promise.reject({message:'please enter the bookmark id'})
            }

            let result = await Model.findOneAndUpdate({ _id:id,user_id:user_id, status:1 },{status:0}); 
            return result;
            
        } catch (error) {
            return Promise.reject({status:0,message:'Something went wrong'})
        }
    }

}


module.exports = Bookmark;