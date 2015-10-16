var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Movie = require('../models/movie');
var Show = require('../models/show');
var App = require('App');

module.exports = Backbone.Collection.extend({
	type: null,

	model: function(attrs, options) {
		switch(options.collection.type) {
	    	case "movies":
	        	return new Movie(attrs, options);
	      	default:
	        	return new Show(attrs, options);
	    }
	},

	initialize: function(models, options) {
		if (options.type) {
			this.type = options.type;
		}
	},

	/**
	 * Get item list
	 */
	getList: function(options, parameters, success, error) {
		var url = Conf.traktTV.api_host + '/' + this.type;

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
						var obj;

						if (this.type == 'movies') {
							obj = item.movie;
						}
						else {
							obj = item.show;
						}

						this.add(obj);
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