const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const schemas = require(__dirname + "/schemas.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.use(express.static("static"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/roll-for-shoes"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id, username: profile.name.givenName }, function (err, user) {
      return cb(err, user);
    });
  }
));

// mongoose

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://LineGoon:" + process.env.MONGO_PW + "@roll-for-shoes.8s4xzsv.mongodb.net/?retryWrites=true&w=majority");

const Character = mongoose.model("Character", schemas.character);
const User = mongoose.model("User", schemas.user);

// Passport

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
          _id: user._id,
          username: user.username,
          email: user.email,
          characters: user.characters
      });
    });
  });
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

//Get Routing//////////////////////////////////////////////////////

app.get("/", (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect("/my-characters", {user: req.user});
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login", {retry: ""});
});

app.get("/login/retry", (req, res) => {
    res.render("login", {retry: "retry"});
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if(!err) {
            res.redirect("/");
        }
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/roll-for-shoes", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
        res.redirect("/my-characters");
  });

app.get("/my-characters", (req, res) => {
    if(req.isAuthenticated()) {
        const charIds = req.user.characters;
        Character.find({_id: {$in: charIds}}, (err, characters) => {
            if(!err) {
                res.render("my-characters", {user: req.user, characters: characters});
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
                res.render("character-builder", {user: req.user, character:character});
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
                res.render("sheet", {user: req.user, character: result});
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
            passport.authenticate("local", {failureRedirect: "/login/retry"})(req, res, function() {   
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
            const name = req.body.skillName;
            const cc = _.camelCase(name);
            const dice = req.body.skillDice;

            const newSkill = new schemas.Skill(name, cc, dice);
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
            const name = newNames[index];
            const cc = _.camelCase(name);
            const dice = newDice[index];

            const newSkill = new schemas.Skill(name, cc, dice);

            skills.push(newSkill);
        };
    }
    return skills;
};

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

function prepareItems(body) {
    const items = [];
    if(body.itemName) {
        const newNames = body.itemName;
        const newDesc = body.itemDesc;
        const newQty = body.itemQty;

        for (let index = 0; index < newNames.length; index++) {
            const name = newNames[index];
            const desc = newDesc[index];
            const qty = newQty[index];
    
            const newItem = new schemas.Item(name, desc, qty);

            items.push(newItem);
        };
    }
    return items;
};

app.post("/:id/new-item", (req, res) => {
    const id = req.params.id;
    const newItems = prepareItems(req.body);

    Character.findById(id, (err, character) => {
        if(!err) {
            const items = character.items.concat(newItems);
            character.items = items;
            character.save();
            res.redirect("/sheet/" + id);
        }
    })
});

app.post("/:id/edit-items", (req, res) => {
    const id = req.params.id;
    const items = prepareItems(req.body);

    Character.findByIdAndUpdate(id, 
        {$set: {items: items}},
        (err) => {
        if(!err) {
            res.redirect("/sheet/" + id);
        }
    });
})

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
    const items = prepareItems(req.body);

    Character.findByIdAndUpdate(id,
        {$set: req.body, skills: skills, items: items, new: false},
        (err) => {
            if(!err) {
                res.redirect("/sheet/" + id);
            } else {
                console.log(err);
            }
    });
});

app.post("/characters/new", (req, res) => {
    const newChar = new Character({
        new: true,
        user: req.user._id
    });

    newChar.save((err, character) => {
        if(!err) {
            User.findByIdAndUpdate(req.user._id, 
                {$push: {characters: character._id}}, 
                (err) => {
                    if(!err) {
                    res.redirect("/character-builder/" + character._id);
                    }
                })
        } else {
            res.send(err);
        }
    });
});

// Fetch Routing /////////////////////////////////////////////////////

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
        Character.findByIdAndRemove(req.params.id, (err, character) => {
            if(!err) {
                User.findByIdAndUpdate(character.user, 
                    {$pull: {characters: character._id}},
                    (err) => {
                        if(!err) {
                            res.send("Delete successful");
                        }
                });
            } else {
                res.send(err);
            }
        });
    });

app.patch("/user", (req, res) => {
    // if(req.isAuthenticated) {
        User.findByIdAndUpdate(req.user._id, req.body, (err) => {
            if(!err) {
                passport.authenticate("local");
                res.send("Update successful");
            } else {
                res.send(err);
            }
        });
    // }
});

app.listen(3000, () => {
    console.log("Rolled for Server successfully");
});