const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { type } = require('os');

//image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

//insert user into database

router.post('/add', upload, (req, res)=> {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    user.save()
    .then((result)=> {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/')
    })
    .catch((err)=> {
        res.json({message: err.message, type: "danger"});
        console.log(err)
    });
})


//Get all users route
router.get('/', (req, res)=> {
   User.find()
   .then((result)=>{
    res.render('index', {title: 'Home Page', users: result});
   })
   .catch((err)=> {
     res.json({ message: err.message});
   })
});

router.get('/add', (req, res)=> {
    res.render('add_users', { title: "Add Users"});
});

//edit a user
router.get('/edit/:id', (req, res)=> {
    let id = req.params.id;
    User.findById(id)
        .then((user)=> {
            res.render('edit_users', {
                title: "Edit User",
                user: user
            });
        })
        .catch((err)=> {
            res.redirect('/');
        })
})

//update user routes 
router.post('/update/:id', upload, (req, res)=> {
    let id = req.params.id;
    let new_image = '';

    if(req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/'+req.body.old_image);
        } catch (err) {
            console.log(err)
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    })
    .then((result)=> {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/')
    })
    .catch((err)=> {
        res.json({ message : err.message, type: 'danger' });
    })

})

module.exports = router;