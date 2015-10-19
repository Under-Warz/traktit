var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Episode = require('../models/episode');

module.exports = Backbone.Collection.extend({
	model: Episode
});