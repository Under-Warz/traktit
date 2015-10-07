var _ = require('underscore');
var Backbone = require('backbone');
var ClientREST = require('ClientREST');
var Conf = require('Conf');
var async = require('async');

module.exports = Backbone.Model.extend({
	defaults: { 
		"language": "fr",
		"country": "fr"
	},

	initialize: function(options) {
		// Request informations about user on login
		async.parallel([
			_.bind(function(callback) {
				this.getWatchedMovies(function(response) {
					callback(null, 'getWatchedMovies');
				}, function() {
					callback("error", 'getWatchedMovies');
				});
			}, this)
		]);
	},

	/** 
	 * Get all movies watched
	 */
	getWatchedMovies: function(success, error) {
		var shows = [];
		var addIndex = 0;
		var addComplete = 0;

		ClientREST.get(Conf.traktTV.api_host + '/sync/watched/movies', { extended: 'images' }, _.bind(function(response) {
			// Save data in user
			this.set('movies', response);

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