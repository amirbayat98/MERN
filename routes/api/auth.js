const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const {check, validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');
const bcrpyt = require('bcryptjs');
const config = require('config');

const User = require('../../models/User');
//@route    get api/auth
// @desc    test route
// @access  Public
router.get('/', auth, async (req, res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
});


// @route   POST api/auth
// @desc    auth user & get token
// @access  Public

router.post('/', [
        check('email', 'please include a valid email').isEmail(),
        check('password', 'password is required').exists()],
    async (req, res) => {


        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        try{


            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({errors : [{msg: 'invalid cerentials'}]});
            }
            //everything that give us promise like .then() we user await before it!
            //return jsonwebtoken -> after register becomed logged on
            const payload = {
                user: {
                    id: user.id,
                }
            };

            const isMatch = await bcrpyt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({errors : [{msg: 'invalid cerentials'}]});
            }

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
