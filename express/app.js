const express = require("express");
const ejs = require("ejs"); //to run template files
const fileUpload = require("express-fileupload");
const flash = require("express-flash");
const session = require("express-session");
const expressValidator = require("express-validator");
const fs = require("fs");
const mysql = require("mysql"); //to connect to DB
const mysql2 = require("mysql2"); //to connect to DB with SSH tunnel
const { Client } = require('ssh2');; //to connect to DB with SSH tunnel
const nodeQueryBuilder = require("node-querybuilder");
const nodemon = require("nodemon"); //to automatically update server
const sharp = require("sharp");
const path = require("path");
const bodyParser = require("body-parser");
const env = require("dotenv").config();
const bcrypt = require("bcrypt"); //to encrypt passwords
const localStrategy = require("passport-local").Strategy;
const passport = require("passport");
const methodOverride = require("method-override");


const { connection } = require("./database-config");

const PORT = 8080; //localhost port

const sshClient = new Client();

const MySQLStore = require("express-mysql-session")(session);

const initializePassport = require('./passport-config');
initializePassport(passport);

const {check, validationResult } = require("express-validator");
const urlencodedParser = bodyParser.urlencoded({
    extended: false });

var app = express(); //use express to run program

// set the view engine to ejs
app.set('view engine', 'ejs');



//any static element like icons and photos live in the assets folder
app.use(express.static(path.join(__dirname, "./assets")));


//to display messages
app.use(flash());


//------------------------------------------USE SESSIONS---------------------------------------------------------

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  });

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready AKA sessions are working');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});

//for password stuff
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true})); //it solves the errors message 'missing credentials' in login

//------------------------------------------USER LOGIN DB STUFF---------------------------------------------------------

//trims blank spaces from values
const validationObject = [
    check("username").trim(),
    check("password").trim(),
];

//posts the sign_up page after user enters credentials
app.post("/sign_up", urlencodedParser, validationObject, async (req,res)=>{
    
    
  
    const errors = validationResult(req); 
    console.log(errors);
    if (!errors.isEmpty()) {
        res.send("Oh no!");
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    //send data inputs from create_account form to user_data DB 
    const sqlQuery = "INSERT INTO user_data (user_first_name, user_last_name, user_email_address, user_name, user_password) VALUES (?, ?, ?, ?, ?)";
    connection.query(
        sqlQuery,
        [req.body.firstName, req.body.lastName, req.body.email, req.body.username, hashedPassword],
        (err, result) => {
            console.log(err);
            res.render("login.ejs");
        }
    );
});


//------------------------------------------IMAGE RELATED STUFF---------------------------------------------------------

app.use(
  fileUpload({
    limits: {
      fileSize: 2000000, // Around 2MB
    },
    abortOnLimit: true,
    limitHandler: fileTooBig,
  })
);

//accepted types of image files
const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

//posts the index page after user uploads image
app.post("/uploadImage", checkAuthenticated, urlencodedParser, validationObject, async (req,res)=>{
    const image = req.files.image;

  if (acceptedTypes.indexOf(image.mimetype) >= 0) {
    const imageDestinationPath = __dirname + "/assets/uploads/" + image.name;
    const resizedImagePath =
      __dirname + "/assets/uploads/resized/" + image.name;

    await image.mv(imageDestinationPath).then(async () => {
      try {
        await sharp(imageDestinationPath)
          .resize(750)
          .toFile(resizedImagePath)
          .then(() => {
            fs.unlink(imageDestinationPath, function (err) {
              if (err) {throw err};
              console.log(imageDestinationPath + " deleted");
            });
          });
      } catch (error) {
        console.log(error);
      }

      //send data inputs from form to user_data DB 
      const sqlQuery = "INSERT INTO image_bank (image_path, image_name, caption, alt_text, user_id) VALUES (?, ?, ?, ?, ?)";
      connection.query(
          sqlQuery,
          ["/uploads/resized/" + image.name, req.body.image_name, req.body.image_caption, req.body.image_alt, req.user.user_id],
          (err, result) => {
              console.log(err);
          }
      );
      res.redirect("/");
    });
  } else {
        res.render("uploadImage.ejs", {
        messages: { error: "I don't believe that's an image. Use the correct file types." },
        });
    }

/*     if (photo === undefined) { // photo doesn't exist
      console.log("photo error");
      return done(null, false, { message: "The photo doesn't exist" });

  } */
    
});

function fileTooBig(req, res, next) {
    res.render("uploadImage.ejs", {
      authenticated: req.isAuthenticated(),
      messages: { error: "Ups. Filesize too large! please upload an image not exceeding 2MB." },
    });
  };


//------------------------------------------COMMENTS---------------------------------------------------------  
app.post("/comment",checkAuthenticated, function(req, res) {
  const comment = req.body.comment;

  connection.query(
    `INSERT INTO comments (comment_input, user_id, image_id) VALUES (?, ?, ?)`,
    [req.body.comment, req.user.user_id, req.body.image_id], 
    (dbErr, dbResult) => {
      console.log(dbErr);

      if (dbErr != null ){
        console.log("comment stuff not working");
        return;
      }else{
        console.log(req.body.comment); //check if comments are working
        // res.redirect("/");
        res.json({
          message: "insert comment",
          comment: req.body.comment,
          username: req.user.user_name
        })
      }
    }
  )

});  

//------------------------------------------LIKES---------------------------------------------------------  
app.post("/like", checkAuthenticated, function (req, res) {
  const like = req.body.like;

  const singleLikeQuery = `SELECT user_id FROM likes
    WHERE likes.image_id = ${req.body.image_id}`;

  connection.query(singleLikeQuery, (err, response) => {
    if (err !== null) {
      console.log("error with single like app.post query" + err);
      return;
    } else {
      if (!req.isAuthenticated()) {
        resolve(false); //in case the user is not logged in
      } else {
        var userFound = false;
        var i = 0;
        while (i < response.length && !userFound) {
          userFound = response[i].user_id === req.user.user_id;
          i++;
        }

        if (!userFound) {
          //if they haven't liked it yet
          connection.query(
            `INSERT INTO likes (user_id, image_id) VALUES (?, ?)`,
            [req.user.user_id, req.body.image_id],
            (dbErr, dbResult) => {
              console.log(dbErr);

              if (dbErr != null) {
                console.log("like stuff not working");
                return;
              } else {
                // res.redirect("/");
                res.json({
                  message: "insert the like"
                })
              }
            }
          );
        } else {
          //if they liked it already
          connection.query(
            `DELETE FROM likes WHERE user_id = ${req.user.user_id} AND image_id = ${req.body.image_id}`,
            (dbErr, dbResult) => {
              console.log(dbErr);

              if (dbErr != null) {
                console.log("delete like stuff not working");
                return;
              } else {
                // res.redirect("/");
                res.json({
                  message: "delete the like"
                })
              }
            }
          );
        }
      }
    }
  });
});

//------------------------------------------GET AND POST APP REQUESTS---------------------------------------------------------

//get the index ejs file to open 
app.get('/', function(req, res) {
    
  //retrieve information about photo and respective user
  connection.query(
    `SELECT image_bank.image_id, image_bank.image_path,
    image_bank.image_name, image_bank.caption, image_bank.alt_text, 
    image_bank.date_upload, user_data.user_name
    FROM image_bank, user_data
    WHERE image_bank.user_id = user_data.user_id
    ORDER BY image_bank.date_upload DESC`, 
    (dbErr, dBphotos) => {
      console.log(dbErr);

      if (dbErr != null ){
        console.log("index stuff not working");
        return;
      }
      else{
        let numberComments = []; //to store nr of comments of each photo
        let comments = []; //to store the comments of each photo
        let numberLikes = []; //to store nr of likes of each photo
        let singleLike = []; //to check if the logged-in user already liked the photo or not

        //array of promises for the comments in each photo
        const numberCommentsPromise = dBphotos.map(photo =>{
          const numberCommentsQuery = `SELECT COUNT(comment_input) AS numberComments
          FROM comments
          WHERE comments.image_id = ${photo.image_id}`;
          
          return new Promise((resolve, reject) => {
            connection.query(numberCommentsQuery, (err, res) =>{
              if (err !== null){
                console.log("error with number of comments query" + err);
                reject(err);
              }
              else{
                console.log("number of commments:" +res[0].numberComments);
                resolve(res[0].numberComments);
              }
            });
          });
        });

        //array of promises for the comments in each photo
        //it only renders index once all comments are stored in array 
        const commentsPromise = dBphotos.map(photo =>{
          const commentQuery = `SELECT comments.comment_input, comments.comment_time, user_data.user_name
          FROM comments, user_data
          WHERE  comments.user_id = user_data.user_id AND comments.image_id = ${photo.image_id}
          ORDER BY comments.comment_time ASC`; //most recent comments at the end
          
          return new Promise((resolve, reject) => {
            connection.query(commentQuery, (err, res) =>{
              if (err !== null){
                console.log("error with comments query" + err);
                reject(err);
              }
              else{
                resolve(res);
              }
            });
          });
        });

        //array of promises for the likes in each photo
        const numberLikesPromise = dBphotos.map(photo =>{
          const numberLikesQuery = `SELECT COUNT(like_id) AS numberLikes
          FROM likes
          WHERE likes.image_id = ${photo.image_id}`;
          
          return new Promise((resolve, reject) => {
            connection.query(numberLikesQuery, (err, res) =>{
              if (err !== null){
                console.log("error with number of likes query" + err);
                reject(err);
              }
              else{
                console.log("number of likes:" +res[0].numberLikes);
                resolve(res[0].numberLikes);
              }
            });
          });
        });

        //array of promises to check if logged in user has liked the photo or not
        const singleLikePromise = dBphotos.map(photo =>{
          const singleLikeQuery = `SELECT user_id FROM likes
          WHERE likes.image_id = ${photo.image_id}`;
          
          return new Promise((resolve, reject) => {
            connection.query(singleLikeQuery, (err, res) =>{
              if (err !== null){
                console.log("error with single like from user query" + err);
                reject(err);
              }
              else{
                if(!req.isAuthenticated()){
                  resolve(false); //in case the user is not logged in
                }
                else{
                  var userFound = false; 
                  var i = 0;
                  while(i < res.length && !userFound){
                    userFound = (res[i].user_id === req.user.user_id);
                    i++;
                  }
                  resolve(userFound); //store it if user has liked the photo
                }
              }
            });
          });
        });

        //wait for promises to be done
        Promise.all(numberCommentsPromise)
        .then(
          results =>{
            numberComments = results;
            return Promise.all(numberLikesPromise);
          })
          .then(
            results =>{
              numberLikes = results;
              console.log(numberLikes);
              return Promise.all(singleLikePromise);
            })
          .then(
            results =>{
              singleLike = results;
              return Promise.all(commentsPromise);
            })
        .then(results =>{
          comments = results;

          //display index page
          res.render("index.ejs", {
            photos: dBphotos,
            comments: comments,
            numberComments: numberComments,
            numberLikes: numberLikes,
            singleLike: singleLike,
            authenticated: req.isAuthenticated()
          });
        }
        )
        .catch(err =>{
          console.error(err);
        })
          
        //the following code doesn't work, so had to use the Promise method

        // for (let i = 0; i<dbResult.length; i++){
        //   const commentsQuery = `SELECT * FROM comments 
        //   WHERE image_id = ?`;
        //   connection.query(commentsQuery, [dbResult[i].image_id], 
        //     (err, commentsResult) => {
        //       if (err){
        //         console.log(err);
                
        //       }
        //       comments.push(commentsResult);  
        //     });
        // }
        
        
      }
    }
  )

  

});

//post index ejs file when http address has /
app.post('/', function(req, res) {
    res.render("index.ejs");
});

//get login ejs file when http address has /login
app.get('/login',checkNotAuthenticated, function(req, res) {
    res.render("login.ejs", {
      authenticated: req.isAuthenticated()
    });
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: "/", //redirect to index page
  failureRedirect: "/login", //reloads page for them to try again
  failureFlash: true
}));

//if user clicks on log out button, render the logout page and log them out
app.post("/logout", checkAuthenticated, function(req, res, next){
  req.logOut(err => { //req.logOut is the thing that ACTUALLY logs the user out of the session
    if (err != null){
      return next(err);
    }
    
    res.render("logout.ejs", {
      messages: { success: "Logged out successfully!"},
      authenticated: req.isAuthenticated()
    });
  }); 
});

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

function checkNotAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}

//get sign up ejs file when http address has /sign_up
app.get('/sign_up', function(req, res) {
    res.render("sign_up.ejs",{
      authenticated: req.isAuthenticated()
    });
});

//get upload image ejs file when http address has /uploadImage
app.get('/uploadImage', checkAuthenticated, function(req, res) {
    res.render("uploadImage.ejs",{
      authenticated: req.isAuthenticated()
    });
});

    
//hosted atm through localhost + PORT 8080
app.listen( PORT, () => {
    console.log( "App running on http://localhost:" + PORT ); } );
