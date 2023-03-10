//jshint esversion:6
require('dotenv').config() //active and running with file .env
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption"); //saving seurally the password in DB
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10

const app = express();

// console.log(md5("1234567"));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });   //create connection and create DB

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //need only this two lines to encrypt the info

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
    res.render("home")
});

app.get("/login", function(req,res){
    res.render("login")
});

app.get("/register", function(req,res){
    res.render("register")
});

app.post("/register", function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err,hash){
    const newUser = new User({
            email: req.body.username,
            password: hash     //turning it into hashX10 function 
    });
    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    });
    }); 
});

app.post("/login", function(req,res){
    const username = req.body.username;
    // const password = md5(req.body.password);
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err,result){
                    if(result === true){
                        res.render("secrets");
                    }
                });
            };
        }
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});