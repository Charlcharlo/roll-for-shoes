const mongoose = require("mongoose");
const passport = require("passport");
const passportMongoose = require("passport-local-mongoose");

exports.Skill = class {
    constructor(name, cc, dice) {
        this.name = name;
        this.cc = cc;
        this.dice = dice;
    }
};

exports.character = mongoose.Schema({
    name: String,
    summary: String,    
    backstory: String,
    skills: Array,
    xp: {
        type: Number,
        default: 0
    },
    new: {
        type: Boolean,
        default: false
    },
    user: String
});

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    characters: Array
});

userSchema.plugin(passportMongoose, {usernameField: "username"});

exports.user = userSchema;