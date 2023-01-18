const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportMongoose = require("passport-local-mongoose");

const schemas = require(__dirname + "/schemas.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.use(express.static("static"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:25420/roll4shoes");

const Skill = mongoose.model("Skill", schemas.skill);
const Character = mongoose.model("Character", schemas.character);

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
});

userSchema.plugin(passportMongoose, {usernameField: "username"});

const User = mongoose.model("User", userSchema);

// Passport

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Get Routing//////////////////////////////////////////////////////

app.get("/", (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect("/my-characters");
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/my-characters", (req, res) => {
    if(req.isAuthenticated()) {
        Character.find((err, characters) => {
            if(!err) {
                res.render("my-characters", {characters: characters});
            }
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/character-builder/:id", (req, res) => {
    if(req.isAuthenticated()) {
        Character.findById(req.params.id, (err, character) => {
            if(!err) {
                res.render("character-builder", {character:character});
            }
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/sheet/:id",(req, res) => {
    if(req.isAuthenticated()) {
        Character.findById(req.params.id, (err, result) => {
            if(!err) {
                res.render("sheet", {character: result});
            }
        });
    } else {
        res.redirect("/login");
    }
});

// Post Routing ////////////////////////////////////////////////////

//Login and Register

app.post("/register", (req, res) => {
    User.register({
        username: req.body.username,
        email: req.body.email
    }, 
    req.body.password, (err) => {
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
        passport.authenticate("local")(req, res, function() {
            res.redirect("/my-characters");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const user = new User(req.body);

    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } 
        else {
            passport.authenticate("local")(req, res, function() {
            res.redirect("/my-characters");
            });
        }
    });
});

//Character Creation and Editing

app.post("/:id/new-skill", (req, res) => {
    const id = req.params.id;
    Character.findById(id, (err, character) => {
        if(!err) {
            const newSkill = new Skill({
                name: req.body.skillName,
                cc: _.camelCase(req.body.skillName),
                dice: req.body.skillDice
            });
            character.skills.push(newSkill);
            character.save((err) => {
                if(!err) {
                    res.redirect("/sheet/" + id);
                }
            });
        }
    });
});

function prepareSkills(body) {
    const skills = [];
    if(body.skillName) {
        const newNames = body.skillName;
        const newDice = body.skillDice;
        for (let index = 0; index < newNames.length; index++) {
            const newSkill = new Skill({
                name: newNames[index],
                cc: _.camelCase(newNames[index]),
                dice: newDice[index]
            });        
            skills.push(newSkill);
        };
    }
    return skills;
}

app.post("/:id/edit-skills", (req, res) => {
    const id = req.params.id;
    
    const skills = prepareSkills(req.body);

    Character.findByIdAndUpdate(id, 
        {$set: {skills: skills}},
        (err) => {
        if(!err) {
            res.redirect("/sheet/" + id);
        }
    });
});

app.post("/:id/edit-info", (req, res) => {
    const id = req.params.id;
    Character.findByIdAndUpdate(id,
        {$set: req.body}, 
        (err) => {
            if(!err) {
                res.redirect("/sheet/" + id);
            } else {
                console.log(err)
            }
    })
});

app.post("/:id/edit-character", (req, res) => {
    const id = req.params.id;

    const skills = prepareSkills(req.body);

    Character.findByIdAndUpdate(id,
        {$set: req.body, skills:skills, new: false}, 
        (err) => {
            if(!err) {
                res.redirect("/sheet/" + id);
            } else {
                console.log(err);
            }
    });
});

app.post("/characters/new", (req, res) => {
    const newChar = new Character({});

    newChar.save((err, character) => {
        if(!err) {
            res.redirect("/character-builder/" + character._id);
        } else {
            res.send(err);
        }
    });
});

// API Routing /////////////////////////////////////////////////////

app.route("/characters")
    .get((req, res) => {
        Character.find((err, result) => {
            if(!err) {
            res.send(result);
            }
        });
    })

    .post((req, res) => {

        const newChar = new Character({
            name: req.body.name,
            summary: req.body.summary,
            xp: req.body.xp
        });
    
        newChar.save((err) => {
            if(!err) {
                res.send("Successfully created a new character");
            } else {
                res.send(err);
            }
        });
    });

app.route("/characters/:id")
    .get((req, res) => {
        Character.findById(req.params.id, (err, result) => {
            if(!err) {
                res.send(result);
            } else {
                res.send(err);
            }
        });
    })
    .put((req, res) => {
        Character.findByIdAndUpdate(req.params.id, 
            req.body,
            {overwrite: true},
            (err) => {
                if(!err) {
                    res.send("Update succesful");
                } else {
                    res.send(err);
                }
            });
    })
    .patch((req, res) => {
        Character.findByIdAndUpdate(req.params.id,
            {$set: req.body},
            (err) => {
                if(!err) {
                    res.send("Update successful");
                } else {
                    res.send(err);
                }
            });
    }).delete((req, res) => {
        Character.findByIdAndRemove(req.params.id, (err) => {
            if(!err) {
                res.send("Delete successful");
            } else {
                res.send(err);
            }
        })
    });

app.listen(3000, () => {
    console.log("Rolled for Server successfully");
});