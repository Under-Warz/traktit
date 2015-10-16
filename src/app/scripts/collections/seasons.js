var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Season = require('../models/season');

module.exports = Backbone.Collection.extend({
	model: Season
});