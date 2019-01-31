var async = require('async')
var mosquittoPBKDF2 = require('mosquitto-pbkdf2');

var Device = require('../models/device');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {
    //res.send('NOT IMPLEMENTED: Site Home Page');

    async.parallel({
        device_count: function(callback) {
            Device.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
    }, function(err, results) {
        res.render('index', { title: 'MQTT Admin', error: err, data: results });
    });

};

// Display list of all Devices.
exports.device_list = function(req, res) {
    //res.send('NOT IMPLEMENTED: Device list');

    Device.find({})
        .exec(function (err, list_devices) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('device_list', { title: 'Device List', device_list: list_devices });
        });
};

// Display detail page for a specific Device.
exports.device_detail = function(req, res) {
    //res.send('NOT IMPLEMENTED: Device detail: ' + req.params.id);

    async.parallel({

        device: function(callback) {
            Device.findById(req.params.id)
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.device==null) { // No results.
            var err = new Error('Device not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('device_detail', { title: 'Device Detail', data: results.device} );
    });

};

// Display Device create form on GET.
exports.device_create_get = function(req, res) {
    //res.send('NOT IMPLEMENTED: Device create GET');

    res.render('device_form', { title: 'Create Device' });

};

// Handle Device create on POST.
exports.device_create_post = [

    //Validate fields
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('type').isLength({ min: 1 }).trim().withMessage('Type must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    //Sanitize fields
    sanitizeBody('name').trim().escape(),
    sanitizeBody('type').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('superuser').trim().escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('device_form', {title: 'Create Device', device: req.body, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            //console.log("Generating hash for password : " + req.body.password);
            mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=>{
                //console.log("Hash created: " + pbkdf2Password);

                    //var topicsdata = {}
                    //topicsdata["public/#"] = "r";
                    //topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";

                    var topicsdata = JSON.parse(req.body.topics);

                    var devicedata = {
                        name: req.body.name,
                        type: req.body.type,
                        password: pbkdf2Password,
                        topics: topicsdata,
                        superuser: req.body.superuser ? true : false
                    };

                    //devicedata['topics'] = topicsdata;

                    // Create a Device object with escaped and trimmed data.
                    var device = new Device(
                        devicedata
                    );

                    device.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        // Successful - redirect to new device record.
                        res.redirect(device.url);
                    });

                }
            );
        }
    }
];

// Display Device delete form on GET.
exports.device_delete_get = function(req, res) {
    async.parallel({
        device: function (callback) {
            Device.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.device == null) { // No results.
            res.redirect('/');
        }
        // Successful, so render.
        res.render('device_delete', { title: 'Delete Device', device: results.device});
    });

};

// Handle Device delete on POST.
exports.device_delete_post = function(req, res) {
    async.parallel({
        device: function (callback) {
            Device.findById(req.body.device_id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        Device.findByIdAndRemove(req.body.device_id, function deleteDevice(err) {
            if (err) { return next(err); }
                // Success - go to device list.
                res.redirect('/devices')
            })

    });
};

// Display Device update form on GET.
exports.device_update_get = function(req, res) {
    Device.findById(req.params.id, function (err, device) {
        if (err) { return next(err); }
        if (device == null) { // No results.
            var err = new Error('Device not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('device_form', { title: 'Update Device', device: device });

    });
};

// Handle Device update on POST.
exports.device_update_post = [
    //Validate fields
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('type').isLength({ min: 1 }).trim().withMessage('Type must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    //Sanitize fields
    sanitizeBody('name').trim().escape(),
    sanitizeBody('type').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('superuser').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Device object with escaped and trimmed data (and the old id!)
        //var topicsdata = {}
        //topicsdata["public/#"] = "r";
        //topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";

        var topicsdata = JSON.parse(req.body.topics);

        var devicedata = {
            _id: req.params.id,
            name: req.body.name,
            type: req.body.type,
            topics: topicsdata,
            superuser: req.body.superuser ? true: false
        };

        //devicedata['topics'] = topicsdata;

        // Create a Device object with escaped and trimmed data.
        var device = new Device(
            devicedata
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('device_form', { title: 'Update Device', device: device, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=> {
                devicedata.password = pbkdf2Password;
                var device = new Device(
                    devicedata
                );

                Device.findByIdAndUpdate(req.params.id, device, {}, function (err, thedevice) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to device detail page.
                    res.redirect(thedevice.url);
                });
            });
        }
    }

];
