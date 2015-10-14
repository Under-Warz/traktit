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
			}, this),
			_.bind(function(callback) {
				this.getWatchlistContent(function(response) {
					callback(null, 'getWatchlistContent');
				}, function() {
					callback("error", 'getWatchlistContent');
				});
			}, this),
			_.bind(function(callback) {
				this.getCollectionMovies(function(response) {
					callback(null, 'getCollectionMovies');
				}, function() {
					callback("error", 'getCollectionMovies');
				});
			}, this),
			_.bind(function(callback) {
				this.getCommentsLikes(function(response) {
					callback(null, 'getCommentsLikes');
				}, function() {
					callback("error", 'getCommentsLikes');
				});
			}, this)
		]);
	},

	/** 
	 * Get all movies watched
	 */
	getWatchedMovies: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/sync/watched/movies', { extended: 'images' }, _.bind(function(response) {
			// Save data in user
			this.set('watchedMovies', response);

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	/**
	 * Get all movies / shows in watchlist
	 */
	getWatchlistContent: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/sync/watchlist', { extended: 'images' }, _.bind(function(response) {
			// Save data in user
			this.set('watchlist', response);

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	/**
	 * Get all movies / shows in watchlist
	 */
	getCollectionMovies: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/sync/collection/movies', { extended: 'images' }, _.bind(function(response) {
			// Save data in user
			this.set('collectionMovies', response);

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	/**
	 * Get all comments likes of the user
	 */
	getCommentsLikes: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/users/likes/comments', { limit: -1 }, _.bind(function(response) {
			// Save data in user
			this.set('commentsLikes', response);

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