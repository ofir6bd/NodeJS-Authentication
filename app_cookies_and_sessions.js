//jshint esversion:6
require('dotenv').config() //active and running with file .env
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption"); //saving seurally the password in DB
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10
const session = require("express-session");     //allow you transfer from page to page if you already signed in before
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

// console.log(md5("1234567"));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "our littel secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });   //create connection and create DB

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //need only this two lines to encrypt the info

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home")
});

app.get("/login", function(req,res){
    res.render("login")
});

app.get("/register", function(req,res){
    res.render("register")
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.post("/register", function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
            });
        }
    });

    // bcrypt.hash(req.body.password, saltRounds, function(err,hash){
    // const newUser = new User({
    //         email: req.body.username,
    //         password: hash     //turning it into hashX10 function 
    // });
    // newUser.save(function(err){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         res.render("secrets");
    //     }
    // });
    // }); 
});

app.post("/login", function(req,res){

    const user = new User({
        username: req.body.password,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
            });
        }
    });

    // const username = req.body.username;
    // // const password = md5(req.body.password);
    // const password = req.body.password;

    // User.findOne({email: username}, function(err, foundUser){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(foundUser){
    //             bcrypt.compare(password, foundUser.password, function(err,result){
    //                 if(result === true){
    //                     res.render("secrets");
    //                 }
    //             });
    //         };
    //     }
    // });
});

app.get("/logout",function(req,res){
    req.logout(function(err) {
        if (err) { 
            console.log(err);
        }
    });
    res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});