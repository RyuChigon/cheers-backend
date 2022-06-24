const mongoose = require('mongoose');

const archiveSchema = mongoose.Schema({
  numOfArchive: {
    type: Number,
    default: 0,
  },
  timeOfArchive: {
    type: String,
    default: '00:00:00'
  }
})

const maxOfArchiveSchema = mongoose.Schema({
  maxOfArchive: {
    type: Number,
    default: 0,
  }
})

const Archive = mongoose.model("Archive", archiveSchema);
const MaxOfArchive = mongoose.model("MaxOfArchive", maxOfArchiveSchema);

module.exports = { Archive, MaxOfArchive };