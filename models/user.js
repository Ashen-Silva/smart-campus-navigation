const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Prevents duplicate usernames
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'guest'],
        default: 'user'
    }
});

module.exports = mongoose.model('User', userSchema);