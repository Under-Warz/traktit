var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Movie = require('../models/movie');
var App = require('App');

module.exports = Backbone.Collection.extend({
	model: Movie,

	/**
	 * Get movies list
	 */
	getList: function(options, parameters, success, error) {
		var url = Conf.traktTV.api_host + '/movies';

		if (options) {
			if (options.type) {
				url += "/" + options.type;
			}
		}

		// Pagination
		var params = { extended: 'images' };

		try {
			if (parameters.limit) {
				params.limit = Conf.pagination.limit;
			}
		}
		catch (e) {}

		ClientREST.get(url, _.extend(params, parameters), _.bind(function(response) {
			// Build movies models
			if (options) {
				if (options.type == 'popular') {
					_.each(response, _.bind(function(item) {
						this.add(item);
					}, this));
				}
				else {
					_.each(response, _.bind(function(item) {
						this.add(item.movie);
					}, this));
				}
			}

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	}
});