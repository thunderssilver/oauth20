const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({

	google:{
    username: String,
    googleId: String,
    thumbnail: String
    },
    facebook:{

    	id: String,
		token: String,
		email: String,
		name: String
    },
    local: {
		username: String,
		password: String
	},
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

const User = mongoose.model('agent', userSchema);

module.exports = User;
