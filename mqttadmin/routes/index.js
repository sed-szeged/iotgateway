var express = require('express');
var router = express.Router();
const { ensureAuth, ensureGuest, ensureAdminAuth } = require('../middleware/auth')

var device_controller = require('../controllers/deviceController');

/*-------------------------------*\
|----------LOGIN ROUTE------------|
\*-------------------------------*/

// GET Login page
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {title: 'IoTGateway Login'});
})

/*-------------------------------*\
|-----LOGGED IN USER ROUTES-------|
\*-------------------------------*/

// GET catalog home page.
router.get('/home',  ensureAuth, device_controller.index);

// GET request for creating a Device. NOTE: This must come before routes that display Device (uses id).
router.get('/device/create', ensureAuth, device_controller.device_create_get);

// POST request for creating Device.
router.post('/device/create', ensureAuth, device_controller.device_create_post);

// GET request to delete Device.
router.get('/device/:id/delete', ensureAuth, device_controller.device_delete_get);

// POST request to delete Device.
router.post('/device/:id/delete', ensureAuth, device_controller.device_delete_post);

// GET request to update Device.
router.get('/device/:id/update', ensureAuth, device_controller.device_update_get);

// POST request to update Device.
router.post('/device/:id/update', ensureAuth, device_controller.device_update_post);

// GET request for one Device.
router.get('/device/:id', ensureAuth, device_controller.device_detail);

// GET request for list of all Device items.
router.get('/devices', ensureAuth, device_controller.device_list);

/*-------------------------------*\
|----------ADMIN ROUTES-----------|
\*-------------------------------*/

// GET request for admin page
router.get('/admin', ensureAdminAuth, device_controller.index_admin);

// GET request to list all devices in database
router.get('/admin/devices', ensureAdminAuth, device_controller.device_list_all);

// GET request to list all users in database
router.get('/admin/users', ensureAdminAuth, device_controller.users_list_all);

// GET request for any device
router.get('/admin/device/:id', ensureAdminAuth, device_controller.device_detail_admin);

// GET request to delete Device.
router.get('/admin/device/:id/delete', ensureAdminAuth, device_controller.device_delete_get_admin);

// POST request to delete Device.
 router.post('/admin/device/:id/delete', ensureAdminAuth, device_controller.device_delete_post_admin);

// GET request to update Device.
router.get('/admin/device/:id/update', ensureAdminAuth, device_controller.device_update_get_admin);

// POST request to update Device.
router.post('/admin/device/:id/update', ensureAdminAuth, device_controller.device_update_post_admin);


module.exports = router;
