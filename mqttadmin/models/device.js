var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DeviceSchema = new Schema(
    {
        name: {type: String, required: true},
        type: {type: String},
        password: {type: String, required: true},
        topics: {type: Object},
        superuser: {type: Boolean},
        user: {type: String, required: true}
    }
);

DeviceSchema
    .virtual('url')
    .get(function () {
        return '/device/' + this._id;
    });

//Export model
module.exports = mongoose.model('Device', DeviceSchema);