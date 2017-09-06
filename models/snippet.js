const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  language: {
    type: String,
    required: true
  },
  tags:[String]
})

const Snippet = mongoose.model('Snippet', snippetSchema)

module.exports = Snippet;
