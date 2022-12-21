const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema; //Shortens syntax

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//adds username, hashed pw, and salt field, along with some methods to the schema
UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model('User', UserSchema);