const movieModel = require('./moviesModel');
const axios = require('axios');

class Movies{

    async getMoviesData(text,type){
        try {   
                let tmbdId = []; 
                let exitId = [];
                let   uniqiue;
                let searchtxt;

                if(type === 1 ){                                                    // if type 1 is for movie
                    searchtxt = "movie"
                }                                                                   // if type 2 is for tv shows
                if(type === 2 ){
                    searchtxt = "tv"
                }  
                                                                  // fetch the TMBD movies & tv shows data
                const response = await axios.get(`https://api.themoviedb.org/3/search/${searchtxt}?api_key=${process.env.TMDB_KEY}&language=en-US&query=${text}&page=1&include_adult=false`);
                let data = response.data.results;

                data.forEach(element => {                                               // push ids in tmbd array
                    tmbdId.push(element.id);
                });
            

                let exitMovie = await movieModel.find({id:{$in:tmbdId}});               // if tmbd id exit in database

                exitMovie.forEach(element => {                                           // fetch the exits ids push in exitId array
                    exitId.push(element.id);    
                });
            
                if(exitMovie.length>0)
                {
                     uniqiue = tmbdId.filter(val=> !exitId.toString().includes(val) );                   // get the unique ids and its data
                    
                    let newOne = data.map((uniqiueData) =>{
                        if (uniqiue.includes(uniqiueData.id)) return uniqiueData;
                    }) .filter((e) => e)
                
                    for(let i=0; i<newOne.length; i++){                                                         // update the unique data
                        newOne[i].type = type;   
                        if(newOne[i].first_air_date!=null && newOne[i].first_air_date.length){
                            newOne[i].release_date = newOne[i].first_air_date
                        }                                                                                        // update the poster_path & backdrop_path
                        if(newOne[i].poster_path != null && newOne[i].poster_path.length){
                            newOne[i].poster_path = `https://image.tmdb.org/t/p/w500${newOne[i].poster_path}`;
                        }
                        if(newOne[i].backdrop_path != null && newOne[i].backdrop_path.length){
                            newOne[i].backdrop_path = `https://image.tmdb.org/t/p/w500${newOne[i].backdrop_path}`;
                        }
                    } 
                    let result1 = await movieModel.insertMany(newOne)                                          // save the TMBD data in database
                    return result1;
                }else{
                                                                                                                // update the data 
                for(let i=0; i<data.length; i++){
                    data[i].type = type;
                    
                    if(data[i].first_air_date!=null && data[i].first_air_date.length){
                        data[i].release_date = data[i].first_air_date
                    }
                                                                            // update the poster_path & backdrop_path
                    if(data[i].poster_path != null && data[i].poster_path.length){
                        data[i].poster_path = `https://image.tmdb.org/t/p/w500${data[i].poster_path}`;
                    }
                    if(data[i].backdrop_path != null && data[i].backdrop_path.length){
                        data[i].backdrop_path = `https://image.tmdb.org/t/p/w500${data[i].backdrop_path}`;
                    }
            }  

                let result = await movieModel.insertMany(data)                                          // save the TMBD data in database
                return result;
        }
        
    } catch (error) {
          return  Promise.reject({status:400, message:'Something went wrong', error:error})
        }
        
    }

    async getDataById(type,_id){
        try {
            let searchtxt;

            if(type === 1 ){                                                    // if type 1 is for movie
                searchtxt = "movie"
            }                                                                   // if type 2 is for tv shows
            if(type === 2 ){
                searchtxt = "tv"
            }  
            let exitData = await movieModel.findById({_id:_id})  ;               // fetch the data from database
           
            if(!exitData){
                return Promise.reject({status:404,message:'Not found in database'})
            }else{
                    let newDate = new Date();
                    let time = newDate-exitData.date;
                    
                    let hours = 8.64e+7

                    if(time<hours) return exitData;                          // if time is smaller then 24 h
                    
                    let id = exitData.id                                              // else time is greater
                                 // fetch the TMBD movies & tv shows data                                     
                    const response = await axios.get(`https://api.themoviedb.org/3/${searchtxt}/${id}?api_key=${process.env.TMDB_KEY}&language=en-US&page=1&include_adult=false`);
                    let data = response.data;

                    let getData = {                                      // update data fetch from detail api
                                   tagline:data.tagline,
                                   spoken_languages:data. spoken_languages,
                                   revenue:data.revenue,
                                   genre_ids:data.genres,
                                   title:data.title,
                                   status:data.status,
                                   production_countries:data.production_countries,
                                   production_companies:data.production_companies,
                                   status_updated:1,
                                   date:new Date()
                    }

                    let result = await movieModel.findByIdAndUpdate(_id, getData,{new:true})
                    return result;
            }
          
        } catch (error) {
            return  Promise.reject({status:400, message:'Something went wrong', error:error})
        }
    }
}
module.exports = Movies;