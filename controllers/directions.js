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
  app.get('/directions', function (req, res) {
    res.render('directions/directions', {
    });
  });
};
