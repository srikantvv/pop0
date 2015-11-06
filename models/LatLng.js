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

var latLngSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number }
});

module.exports = mongoose.model('LatLng', latLngSchema);
