var mongoose = require('mongoose');
var {Schema} = require('mongoose');

var PollSchema = new Schema({
  name: {type: String, required: true, unique: true},
  options: [{
    name: {type: String, required: true},
    votes: {type: Number, required: true, default: 0},
  }],
  owner: {type: Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('Poll', PollSchema);