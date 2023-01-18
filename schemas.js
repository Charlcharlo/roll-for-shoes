const mongoose = require("mongoose");
const passport = require("passport");
const passportMongoose = require("passport-local-mongoose")

const skillSchema = mongoose.Schema({
    name: String,
    cc: String,
    dice: Number
});

exports.skill = skillSchema;

const characterSchema = mongoose.Schema({
    name: String,
    summary: String,    
    backstory: String,
    skills: [skillSchema],
    xp: Number,
    new: {
        type: Boolean,
        default: true
    }
});

exports.character = characterSchema;

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
});

userSchema.plugin(passportMongoose, {usernameField: "username"});

exports.user = userSchema;