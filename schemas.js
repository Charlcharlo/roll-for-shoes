const mongoose = require("mongoose");
const passport = require("passport");
const passportMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');


exports.Skill = class {
    constructor(name, cc, dice) {
        this.name = name;
        this.cc = cc;
        this.dice = dice;
    }
};

exports.Item = class {
    constructor(name, description, qty) {
        this.name = name;
        this.description = description;
        this.qty = qty;
    }
}

exports.character = mongoose.Schema({
    name: String,
    summary: String,    
    backstory: String,
    skills: Array,
    items: Array,
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
    googleId: String,
    characters: Array
});

userSchema.plugin(passportMongoose, 
    {
        usernameQueryFields: ["email", "username"]
    }
);

userSchema.plugin(findOrCreate);

exports.user = userSchema;