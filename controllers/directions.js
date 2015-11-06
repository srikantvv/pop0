'use strict';
/**
 * Account Controller
 */

var Road	= require('../models/Road');
module.exports.controller = function (app) {

  app.post('/directions', function (req, res) {
    console.log(req.body.response);
    res.render('directions/directions', {
    });
  });

  app.post('/directions/:from/:to', function (req,res) {
    console.log(req.params.from);
    console.log(req.params.to);
    res.render('directions/directions', {
      pacFrom: req.params.from,
      pacTo: req.params.to
    });
  });

  app.get('/directions/:from/:to', function (req,res) {
    res.render('directions/directions', {
      pacFrom: req.params.from,
      pacTo: req.params.to
    });
  });

  app.post('/getroad', function (req, res) {
    Road.find({ start_lat : req.body.start_lat }, function (err, items) {
      res.json(items);
    });
  });

  app.post('/postroad', function (req, res) {
    var road = new Road();
    for (var k = 0; k < req.body.midLatLng.length; k++) {
      road.midpath.push({ lat: req.body.midLatLng[k].lat , lng: req.body.midLatLng[k].lng });
    }
    road.start_lat = req.body.start_lat;
    road.start_lng = req.body.start_lng;
    road.end_lng = req.body.end_lng;
    road.end_lat = req.body.end_lat;
    road.enc_path = req.body.encodeString;
    road.distance = req.body.distance;
    road.save(function (err) {
      res.json();
    });
  });

  app.get('/directions', function (req, res) {
    res.render('directions/directions', {
    });
  });
};
