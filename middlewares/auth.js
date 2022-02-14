const Story = require('../models/story');

exports.isGuest = (req, res, next) =>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/profile');
    }
};

exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error', 'You need to login first');
        return res.redirect('/login');
    }
};

exports.isAuthor = (req,res,next) =>{
    let id = req.params.id;
    Story.findById(id)
    .then(story=>{
        if(story){
            if(story.author == req.session.user){
                return next();
            } else {
                let err = new Error("Unauthorized to access the resource")
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};

exports.isNotAuthor = (req,res,next) =>{
    let id = req.params.id;
    Story.findById(id)
    .then(story=>{
        if(story){
            if(story.author != req.session.user){
                return next();
            } else {
                let err = new Error("Unauthorized to access the resource")
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};