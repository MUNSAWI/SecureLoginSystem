const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
}
});

const User = mongoose.model("User", userSchema);

module.exports = User;