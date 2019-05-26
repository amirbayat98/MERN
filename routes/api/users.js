const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('config');

// //@route    get api/users
// // @desc    test route
// // @access  Public
// router.get('/', (req, res)=>{
//     res.send('User route');
// });

// @route   POST api/users
// @desc    Reigster user
// @access  Public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'please include a valid email').isEmail(),
    check('password', 'please enter a password with at least 6 characters').isLength({min : 6})],
    async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;
    try{
        //see if user exist
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors : [{msg: 'user already exist'}]});
        }
        //get user gravatar
        const avatar = gravatar.url(email, {
           s: '200',
           r: 'pg',
           d: 'mm'
        });

        user = new User({
           name,
           email,
           avatar,
           password
        });
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await  bcrypt.hash(password, salt);
        await user.save();

        //everything that give us promise like .then() we user await before it!
        //return jsonwebtoken -> after register becomed logged on
        const payload = {
            user: {
                id: user.id,
            }
        };
        jwt.sign(payload,
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err, token) => {
                if(err) throw err;
                res.json({token});
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }


});

module.exports = router;
