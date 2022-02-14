//require modules
const express = require('express');
const morgan = require('morgan');
const storyRoutes = require('./routes/storyRoutes');
const {MongoClient} = require('mongodb');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const User = require('./models/user');
const {initCollection} = require('./models/story');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const Story = require('./models/story');


//create app
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
//let url = 'mongodb://localhost:27017';
app.set('view engine', 'ejs');
app.set('views', 'views');

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
    secret:'kjhsdkjas64665hgdjaldjsl',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/project'})
}));

app.use(flash());

app.use((req,res, next)=>{
    //console.log(req.session);
    res.locals.user=req.session.user||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//connect to database

mongoose.connect('mongodb://localhost:27017/project',
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
        });
})
.catch(err=>console.log(err.message));

//set up routes
app.get('/', (req, res) => {
    res.render('index');
});

//get signup form
app.get('/signup', (req, res)=>{
    if(!req.session.user)
    return res.render('signup')
    else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/profile');
    }
});

//create a new user
app.post('/', (req, res, next)=>{
    if(!req.session.user){
        let user = new User(req.body);
    user.save()
    .then(()=>res.redirect('/login'))
    .catch(err=>{
        if(err.name ==='ValidationError'){
            req.flash('error', err.message);
            return res.redirect('/signup');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email address has been used!');
            return res.redirect('signup');
        }
        next(err);
    });
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/profile');
    }
    
});

//get login
app.get('/login', (req, res)=>{
    if(!req.session.user){
    return res.render('login')
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/profile');
    }
});


//process login request

app.post('/login', (req, res)=>{
    if(!req.session.user) {
        let email = req.body.email;
    let password = req.body.password;
    
    //get user that matches email
    User.findOne({email: email})
    .then(user=> {
        if(user) {
            //user found 
            user.comparePassword(password)
            .then(result=>{
                if(result){
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in!');
                    res.redirect('/profile')
                } else {
                    console.log('wrong password');
                    req.flash('error', 'Wrong password!')
                    res.redirect('/login');
                }
            })
        } else {
            //console/log('wrong email address');
            req.flash('error', 'Wrong email address!')
            res.redirect('/login');
        }
    })
    .catch(err=>next(err));
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/profile');
    }
    

});
app.get('/profile', (req, res, next)=>{
    if(req.session.user){
    let id = req.session.user; 
    Promise.all([User.findById(id), Story.find({author: id})])
    .then(results=>{
        const [user, stories] = results;
        res.render('profile', {user, stories});
    })
    .catch(err=>next(err));
} else {
    req.flash('error', 'You need to login first');
        return res.redirect('/login');
}
    
});

//logout

app.get('/logout', (req, res, next)=>{
    if(req.session.user){
    req.session.destroy(err=>{
        if(err)
        return next(err);
        else
            res.redirect('/');
    });
} else {
    req.flash('error', 'You need to login first');
        return res.redirect('/login');
}
})


app.use('/stories', storyRoutes);

app.use((req, res, next)=>{
    let err = new Error('The server cannot locate ' +req.url);
    err.status = 404;
    next(err);
})