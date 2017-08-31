const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {type: String, required: true, lowercase: true, unique: true},
  body: {type: String, required: true},
  notes: {type: String},
  language: {type: String, required: true},
  tags:[String]
})

const Snippet = mongoose.model('Snippet', snippetSchema)

module.exports = Snippet;
