const bcrypt = require("bcryptjs");


function hashPassword(password) {
    return bcrypt
    .genSalt()
    .then((salt) => bcrypt.hash(password, salt))
    .then(hashedPassword => {
        return hashedPassword
    })
}

function hashPasswords(usersData) {
    const promises = usersData.map(user => {
        if (user.password) {
            return hashPassword(user.password)
                .then(hashedPassword => ({ ...user, password: hashedPassword }));
        } else {
            return Promise.resolve(user);
        }
    });

    return Promise.all(promises);
}


module.exports = hashPasswords