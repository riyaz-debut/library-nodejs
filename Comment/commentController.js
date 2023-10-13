const mongoose = require('mongoose');
const Model = require('./commentModel');
const movieModel = require('../Movies/moviesModel');

class Comment{
    
    async addComment(data){
        try {
                                                                  // check for if movie doesn't exit
                let movieExit = await movieModel.findOne({_id:data.reference_id});
                if(!movieExit){
                    return Promise.reject({message:'This reference_id does not exit'})
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
                                            $eq:['$_id','$$ref_id'],
                                        }
                                    }
                                },
                                {$project:{ type:1, title:1, name:1, release_date:1, original_language:1 }}
                            ],
                            as:'itemData'
                        }
                    },
                    {$unwind:'$itemData'},
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
                        $project:{
                            comment:1,
                            type:1,
                            is_deleted:1,
                            userData:1,
                            itemData:1,
                        }
                    }
                ])

                return result;

        } catch (error) {
            console.log(error)
            return Promise.reject({status:0, message:'Something went wrong'})
        }
    }

    async editComment(id,data){
        try {
            if(id.trim() ===''){                                                // if rating id is empty
                return Promise.reject({message:'please enter the comment id'})
            }

            let result = await Model.findOneAndUpdate({_id:id, user_id:data.user_id,is_deleted:0},data,{new:true})
            return result;
            
        } catch (error) {
            return Promise.reject({status:0, message:'Something went wrong'})
        }
    }


    async delComment(id,user_id){
        try {
            if(id.trim() ===''){                                                // if rating id is empty
                return Promise.reject({message:'please enter the comment id'})
            }
            let result = await Model.findOneAndUpdate({_id:id, user_id:user_id, is_deleted:0},{is_deleted:1})
            return result;
            
        } catch (error) {
            console.log(error)
            return Promise.reject({status:0, message:'Something went wrong'})
        }
    }

    async getComment(id,page){
        try {

                                                                 // check for if movie doesn't exit
            let movieExit = await movieModel.findOne({_id:id});
            if(!movieExit){
                return Promise.reject({message:'This reference_id does not exit'})
            }

            let pageSize = 10;
            let result = await Model.aggregate([
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
                            {$project:{ type:1, title:1, name:1, release_date:1, original_language:1 }}
                        ],
                        as:'itemData'
                    }
                },
                {$unwind:'$itemData'},
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
                            {$project :{ firstName:1 , lastName:1, email:1 }}
                        ],
                        as:'userData'
                    }
                },
                {$unwind:'$userData'},
                {
                    $addFields:{
                        'userData.commentId':'$_id',
                        'userData.comment':'$comment',
                        'userData.type':'$type',
                    }
                },
                {
                    $project:{
                        userData:1,
                        itemData:1,

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
            return Promise.reject({status:0, message:'Something went wrong'})
        }
    }

    

}


module.exports = Comment;