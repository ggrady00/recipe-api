const bcrypt = require("bcryptjs");

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email)
}




module.exports = isValidEmail