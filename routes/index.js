var express = require('express');
var router = express.Router();
var passport = require('passport'),
    LocalStrategy   = require('passport-local').Strategy;
var flash = require('connect-flash');
var mongoose = require('mongoose');
var use = require('../models/users');
var readyusers = require('../models/ready_users');
/* GET home page. */
var session;
router.get('/', function(req, res, next) {
    session = req.session;
    console.log(req.session);
    readyusers.count({},function(err,count){
        res.render('index', { title: 'ChessWeb',session:session,logout:req.flash('log_out'),login:req.flash('success'),count:count});
    });
});

router.get('/register', function(req, res, next) {
    res.render('register',{error:req.flash('error'),reg_error:req.flash('error_msg'),session:session});
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login',error:req.flash('error'),reg_success:req.flash('success_msg'),session:session});
});

router.post('/register', function(req, res, next) {

    var firstname = req.body.first;
    var lastname = req.body.last;
    var username = req.body.username;
    var password = req.body.password;
    var confpassword = req.body.confirm;
    if(password!=confpassword)
    {
        req.flash('error_msg','Passwords do not match');
        res.redirect('register');
    }
    else
    {
        use.find({"username":username},function (err,docs) {
            if(docs.length!=0){
                req.flash('error_msg','Username already exists');
                res.redirect('/register');
            }
            else {
                var user = new use({
                    "first":firstname,
                    "last":lastname,
                    "username":username,
                    "password":password,
                    "points":100
                });
                user.save(function (err, updated) {
                    if (err) console.log(err);
                    req.flash('success_msg','You are registered and can now Login');
                    res.redirect('/login');
                });
            }
        });
    }

});

router.post('/login', passport.authenticate('userlogin', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash:true,
    successFlash:true
}));

passport.use('userlogin',new LocalStrategy(
    function(username, password, done) {
        use.findOne({ 'username' :  username },
            function(err, user) {
                if (err)
                    return done(err);
                if (!user){
                    return done(null, false, { message:'Incorrect Username/Password'});
                }
                if (!isValidPassword(user, password)){
                    return done(null, false, { message:'Incorrect Password'});
                }
                return done(null, user,{message:'You have Logged In successfully'});
            }
        );

    })
);
var isValidPassword = function(user, password){
    return user.password==password;
}
passport.serializeUser(function(user, done) {
    console.log('serializing user..');
    var sessionUser = {_id:user._id,name:user.username,points:user.points};
    done(null, sessionUser);
});

passport.deserializeUser(function(id, done) {
    use.findById(id, function(err, user) {
        done(err, user);
    });
});

router.get('/logout', function(req, res) {
    readyusers.remove({"_id":req.session.passport.user._id},function(err){
        if(err) return console.log(err);
    });
    req.logout();
    req.flash('log_out','You have successfully logged out');
    res.redirect('/');
});

router.get('/leaderboard', function(req, res, next) {
    use.find({}).sort({points: -1}).exec(function(err, data) {
        res.render('leaderboard', {users:data,title:"Leaderboard",session:session});
    });
});

router.get('/settings', function(req, res, next) {
    res.render('settings', { title: 'ChessWeb',session:session});
});

router.get('/ready/:id', function (req, res, next) {
    readyusers.find({},function(err, data) {
        res.render('readypage', {users:data,title:"Users ready to play",session:session});
    });
    if(req.session.passport && req.session.passport.user){
        var readyuser = new readyusers({
            "_id":req.session.passport.user._id,
            "username":req.session.passport.user.name,
            "points":req.session.passport.user.points
        });
        readyuser.save(function (err, updated) {
            if (err) console.log(err);
        });
    }
});

module.exports = router;
