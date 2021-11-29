var express = require('express');
const passport = require('passport');
const { route } = require('.');
var router = express.Router();

var device_controller = require('../controllers/deviceController');

// GET catalog home page.

router.get('/google', passport.authenticate('google',{ scope: ['profile'] } ))

router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/home')
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;
