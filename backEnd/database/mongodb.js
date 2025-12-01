const mongoose = require('mongoose');

const database = () => {
    const mongoose = require('mongoose');
    mongoose.connect('mongodb+srv://rushabh:rsavaliya@cluster0.k5krv8y.mongodb.net/e-commerce')
        .then(() => console.log('database connected'))
        .catch((err) => console.log(err.message));
}
module.exports = database;