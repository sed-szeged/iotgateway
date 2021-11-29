var async = require('async');
var Device = require('../models/device');

var mosquittoPBKDF2 = require('mosquitto-pbkdf2');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.device_list_get = function(req, res) {
    Device.find({})
        .select('_id name type topics superuser _v')
        .where('user').equals(String(req.user.googleId))
        .exec(function (err, list_devices) {
            if (err) { return next(err); }
            res.json(list_devices);
        });
};

exports.device_list_post = function(req, res) {

};

exports.device_delete = function(req, res) {

    Device.deleteOne()
        .where('_id').equals(req.params.id)
        .where('user').equals(req.user.googleId)
        .exec(function (err){
            if (err) {return next(err); }
            res.json({'msg': `Device of id ${req.params.id} has been deleted`});
        });

};

exports.device_get = function(req, res) {

    Device.find({})
        .where('_id').equals(String(req.params.id))
        .where('user').equals(req.user.googleId)
        .select('_id name type topics superuser _v')
        .exec(function (err, device){
            if (err) {return next(err); }
            res.json(device)
        });
};

exports.device_create_post = [

    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('type').isLength({ min: 1 }).trim().withMessage('Type must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    sanitizeBody('name').trim().escape(),
    sanitizeBody('type').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('superuser').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.json({title: 'Create Device', device: req.body, errors: errors.array()});
            return;
        }
        else {
                        // Data from form is valid.
            //console.log("Generating hash for password : " + req.body.password);
            mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=>{
                //console.log("Hash created: " + pbkdf2Password);

                    var topicsdata = {}
                    //topicsdata["public/#"] = "r";
                    //topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";

                    if( req.body.topics === undefined){
                        topicsdata["public/#"] = "r";
                        topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";
                    } else {
                        topicsdata = JSON.parse(req.body.topics);
                    }

                    var devicedata = {
                        name: req.body.name,
                        type: req.body.type,
                        password: pbkdf2Password,
                        topics: topicsdata,
                        superuser: req.body.superuser ? true : false,
                        user: req.user.googleId
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
                        // Successful - respond with device's url
                        res.json(device.name + '/' + device._id);
                    });

                }
            );
        }
    }
];

exports.device_update = [

    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.'),
    body('type').isLength({ min: 1 }).trim().withMessage('Type must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    sanitizeBody('name').trim().escape(),
    sanitizeBody('type').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('superuser').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.json({title: 'Create Device', device: req.body, errors: errors.array()});
            return;
        }
        else {
                        // Data from form is valid.
            //console.log("Generating hash for password : " + req.body.password);
            mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=>{
                //console.log("Hash created: " + pbkdf2Password);

                    var topicsdata = {}
                    //topicsdata["public/#"] = "r";
                    //topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";

                    if( req.body.topics === undefined){
                        topicsdata["public/#"] = "r";
                        topicsdata["device/" + req.body.type + "/" + req.body.name + "/#"] = "rw";
                    } else {
                        topicsdata = JSON.parse(req.body.topics);
                    }

                    var devicedata = {
                        _id: req.params.id,
                        name: req.body.name,
                        type: req.body.type,
                        password: pbkdf2Password,
                        topics: topicsdata,
                        superuser: req.body.superuser ? true : false,
                        user: req.user.googleId
                    };

                    //devicedata['topics'] = topicsdata;

                    // Create a Device object with escaped and trimmed data.
                    var device = new Device(
                        devicedata
                    );

                    

                    Device.findByIdAndUpdate(req.params.id, device, {}, function (err, thedevice) {
                        if (err) {
                            return next(err);
                        }

                        res.json(thedevice.url);
                    });

                }
            );
        }
    }
];