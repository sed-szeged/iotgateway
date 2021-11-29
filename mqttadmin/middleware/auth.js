module.exports = {
    ensureAuth: function(req, res, next){
        if(req.isAuthenticated()) {
            return next()
        } else {
            res.redirect('/')
        }
    },
    ensureGuest: function(req, res, next){
        if(req.isAuthenticated()){
            res.redirect('/home')
        } else {
            return next()
        }
    },
    ensureAdminAuth: function(req, res, next){
        if(req.isAuthenticated() && process.env.ADMIN_GOOGLE_ID == req.user.googleId) {
            return next()
        } else {
            res.redirect('/home')
        }
    },
}