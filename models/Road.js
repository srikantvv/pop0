'use strict';

/**
 * Module Dependencies
 */

var mongoose  = require('mongoose');

/**
 * Define Road Schema
 */

// The permitted SchemaTypes are:

// String
// Number
// Date
// Buffer
// Boolean
// Mixed
// ObjectId
// Array

// When your application starts up, Mongoose automatically calls
// ensureIndex for each defined index in your schema. While nice
// for development, it is recommended this behavior be disabled
// in production since index creation can cause a significant
// performance impact. Disable the behavior by setting the
// autoIndex option of your schema to false.

var roadSchema = new mongoose.Schema({

  start_lat: { type: Number },
  start_lng: { type: Number },
  end_lat: { type: Number },
  end_lng: { type: Number },
  type: { type: String, default: 'road' },

}, { collection: 'steplistn' });

module.exports = mongoose.model('Road', roadSchema);
