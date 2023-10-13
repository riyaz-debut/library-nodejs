const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
require('./connection');
const port = process.env.PORT;
const bodyParser = require('body-parser');
const swig = require('swig')
const path = require('path');
const cors = require('cors')
const cron = require('node-cron');

// cron.schedule(' */5 * * * * *', () => {
//   console.log('======cron job =======');
// });

// View Engine Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')
app.engine('html',swig.renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*'}));

app.use("/", require("./User/userRouter"));
app.use("/",require('./Movies/moviesRouter'));
app.use("/recommendation",require('./Recommendation/recommendationRouter'));
app.use('/like', require('./Likes/likesRouter'));
app.use('/bookmark', require('./Bookmark/bookmarkRouter'));
app.use('/comment', require('./Comment/commentRouter'));
app.use('/firebase',require('./Firebase/index'));
app.use('/payment', require('./Payment/index'));
app.use('/author',require('./Author/authorRouter'));
app.use('/genre', require('./Genres/genresRouter'));
app.use('/book',require('./Book/bookRouter'));


app.listen(port, ()=> console.log(`port is listing on ${port}`));