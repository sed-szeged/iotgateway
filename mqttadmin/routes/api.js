var express = require('express');
var router = express.Router();
const Device = require('../models/device');
const User = require('../models/User');

//Google auth for mobile app
const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

var api_device_controller = require('../controllers/apiDeviceController');

function checkAuthenticated(req, res, next){
        let token = req.cookies['session-token'];
        
        user = {};
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,  // Specify the GOOGLE_CLIENT_ID of the app that accesses the backend
            });
            const payload = ticket.getPayload();
            user.firstName = payload.given_name;
            user.lastName = payload.family_name;
            user.name = payload.name;
            user.email = payload.email;
            user.picture = payload.picture;
            user.googleId = payload.sub;

        }
        verify()
            .then(()=>{
                req.user = user;
                next();
                })
                .catch(err=>{
                console.log(err);
            });
}

router.get('/', function(req, res, next){
        res.send('basic response');
});

router.post('/device/create',  checkAuthenticated , api_device_controller.device_create_post);

router.get('/devices', checkAuthenticated, api_device_controller.device_list_get);

router.post('/devices', checkAuthenticated, api_device_controller.device_list_post);

router.get('/device/:id', checkAuthenticated, api_device_controller.device_get);

router.delete('/device/:id', checkAuthenticated, api_device_controller.device_delete);

router.post('/device/:id/update', checkAuthenticated, api_device_controller.device_update);
    
router.get('/tokensignin', function(req, res, next) {
        res.send('tokensignin page get method response');
});
    
router.post('/tokensignin', function(req, res, next){
        let token = req.body.token;
        newUser = {};
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,  // Specify the GOOGLE_CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            async(done) =>{
                const payload = ticket.getPayload();
                newUser.firstName = payload.given_name;
                newUser.lastName = payload.family_name;
                newUser.displayName = payload.name;
                newUser.image = payload.picture;
                newUser.googleId = payload.sub;
    
                try{
                    let user = await User.findOne( {googleId: newUser.googleId})
                    if(user){
                        done(null, user)
                    } else {
                        user = await User.create(newUser)
                        done(null, user)
                    }
                } catch (err){
                    console.error(err)
                }
            }
            
        }
        verify()
        .then(()=>{
             res.cookie('session-token', token);
             res.send(newUser.googleId);
        })
        .catch(console.error);
})
    
router.get('/tokensignout',function(req, res, next){
    res.clearCookie('session-token');
    res.send('logged out');
})

module.exports = router;