#! /usr/bin/env node

console.log('This script populates some test device to the database. ' +
    'Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Device = require('./models/device')
var mosquittoPBKDF2 = require('mosquitto-pbkdf2');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var devices = []

function deviceCreate(name, type, password, topics, superuser) {
    devicedetail =
        {
            name: name,
            type: type,
            password: password,
            topics: topics,
            superuser: superuser
        }

    var device = new Device(devicedetail);

    device.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Device: ' + device);
        devices.push(device)
        cb(null, device)
    }  );
}

function createDevices(cb) {
    async.parallel([
            function(callback) {
                mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=> {
                    deviceCreate('testDevice01', 'testType01', pbkdf2Password, {
                        "public/#": "r",
                        "device/testType01/testDevice01/#": "rw"
                    }, false, callback);
                });
                },
            function(callback) {
                mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=> {
                    deviceCreate('testDevice02', 'testType01', pbkdf2Password, {
                        "public/#": "r",
                        "device/testType01/testDevice02/#": "rw"
                    }, false, callback);
                });
            },
            function(callback) {
                mosquittoPBKDF2.createPasswordAsync(req.body.password, (pbkdf2Password)=> {
                    deviceCreate('testDevice03', 'testType02', pbkdf2Password, {
                        "public/#": "r",
                        "device/testType02/testDevice03/#": "rw"
                    }, false, callback);
                });
            },
        ],
        // optional callback
        cb);
}

async.series([
        createDevices()
    ],
// Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('devices: '+devices);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });



