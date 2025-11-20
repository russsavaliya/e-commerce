const mongoose = require('mongoose');

const database = () => {
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost:27017/e-commerce')
        .then(() => console.log('database connected'))
        .catch((err) => console.log(err.message));
}
module.exports = database;