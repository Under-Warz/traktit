var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Comment = require('../models/comment');
var moment = require('moment');

module.exports = Backbone.Collection.extend({
	model: Comment,
	comparator: function(model) {
		return -moment(model.get('created_at')).unix();
	}
});