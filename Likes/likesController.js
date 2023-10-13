const likesModel = require('./likesModel');
const mongoose = require('mongoose');
const movieModel = require('../Movies/moviesModel');


class Likes{
    async addLikes(data){
        try {
                                                                      // check for if movie doesn't exit
                let movieExit = await movieModel.findOne({_id:data.reference_id});
                if(!movieExit){
                    return Promise.reject({message:'This reference_id does not exit'})
                }

                let exit = await likesModel.findOne({user_id:data.user_id, reference_id:data.reference_id,is_deleted:0})
                if(exit!== null) return Promise.reject({message:'You have already liked'});

                let save = await likesModel.create(data);

                let result = likesModel.aggregate([

                    {$match:{_id:mongoose.Types.ObjectId(save._id)}},
                    {
                        '$lookup':{
                            from: 'users',
                            let:{ref_id:'$user_id'},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:['$_id','$$ref_id'],
                                        },
                                        
                                    }
                                },
                                {$project :{ firstName:1 , lastName:1, email:1}}
                            ],
                            as:'userData'
                        }
                    },
                    {$unwind:'$userData'},
                    {
                        '$lookup':{
                            from:'movies',
                            let:{ref_id:'$reference_id'},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:['$_id','$$ref_id'],
                                        }
                                    }
                                },
                                {$project:{ type:1, title:1, name:1, release_date:1, overview:1, original_language:1 }}
                            ],
                            as:'itemData'
                        }
                    },
                    {$unwind:'$itemData'},
                    {
                        $project:{
                            like:1,
                            type:1,
                            is_deleted:1,
                            userData:1,
                            itemData:1

                        }
                    }
                    
                ])

            return result;
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0, message:'Something went wrong'})
        }
    }

    async deleteLikes(id,user_id){
        try {
            
            if(id.trim() ===''){
                return Promise.reject({message:'Please enter the like id'})
            }

            let result = await likesModel.findOneAndUpdate({_id:id,user_id:user_id, is_deleted:0}, {is_deleted:1});
            return result;
            
        } catch (error) {
            console.log(error)
            return Promise.reject({status:400, message:'Something went wrong'})
        }
    }

    async getLikes(id,page){
        try {
                                                                 // check for if movie doesn't exit
                let movieExit = await movieModel.findOne({_id:id});
                if(!movieExit){
                    return Promise.reject({message:'This reference_id does not exit'})
                }
                
                let pageSize = 10;
                let result = await likesModel.aggregate([
                    {$match:{reference_id:mongoose.Types.ObjectId(id), is_deleted:0}},
                    {
                        '$lookup':{
                            from:'movies',
                            let:{ref_id:'$reference_id'},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:['$_id','$$ref_id'],
                                        }
                                    }
                                },
                                {'$project':{ title:1, name:1, type:1, release_date:1, original_language :1}},
                            ],
                            as:'itemData'
                        }
                    },
                    {   $unwind: "$itemData"},
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
                                {'$project':{ firstName:1, lastName:1, email:1, }},
                            ],
                            as:'userData'
                        }
                    },
                    {   $unwind: "$userData"},
                    {
                        $addFields:{
                            'userData.likeId':'$_id',
                            'userData.like':'$like',
                            'userData.type':'$type',
                        }
                    },
                    {
                        $project:{
                            userData:1,
                            itemData:1

                        }
                    },
                    { $skip : (page - 1)* pageSize},
                    { $limit : pageSize},
                    {
                        $group:{
                            _id:'$itemData._id',
                            type:{$first : "$itemData.type"} ,
                            title :{$first: "$itemData.title"} ,
                            name :{$first: "$itemData.name"} ,
                            release_date :{$first: "$itemData.release_date"} ,
                            userData:{$push:'$userData'},
                            count:{$sum:1}
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

module.exports = Likes;