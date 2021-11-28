const bookSchema = require('./Book');

const { model } = require('mongoose');
const User = require('./User');
const Book = model('Book', bookSchema);


module.exports = { User, Book };
