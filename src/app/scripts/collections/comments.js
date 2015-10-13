var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Comment = require('../models/comment');

module.exports = Backbone.Collection.extend({
	model: Comment
});