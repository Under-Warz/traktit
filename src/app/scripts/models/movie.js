var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');
var async = require('async');

module.exports = Backbone.Model.extend({
	defaults: {
		fetched: false,
		seenit: false
	},

	initialize: function() {
		// Set if movie has been see by user
		this.setMovieSeenIt();
	},

	// Save movie detail in app and optionnaly in persistant storage
	save: function(persistant) {
		App.movies[this.get('ids').slug] = this.toJSON();

		if (persistant) {
			App.savePersistentData('movies', App.movies);
		}
	},

	fetch: function(success, error) {
		async.parallel([
			_.bind(function(callback) {
				this.fetchTranslations(function(response) {
					callback(null, 'fetchTranslations');
				}, function() {
					callback("error", 'fetchTranslations');
				});
			}, this),
			_.bind(function(callback) {
				this.fetchReleasesDates(function(response) {
					callback(null, 'fetchReleasesDates');
				}, function() {
					callback("error", 'fetchReleasesDates');
				});
			}, this),
			_.bind(function(callback) {
				this.fetchCasting(function(response) {
					callback(null, 'fetchCasting');
				}, function() {
					callback("error", 'fetchCasting');
				});
			}, this),
			_.bind(function(callback) {
				this.fetchRatings(function(response) {
					callback(null, 'fetchRatings');
				}, function() {
					callback("error", 'fetchRatings');
				});
			}, this),
			_.bind(function(callback) {
				this.fetchRelated({}, function(response) {
					callback(null, 'fetchRelated');
				}, function() {
					callback("error", 'fetchRelated');
				});
			}, this),
			_.bind(function(callback) {
				this.fetchComments({}, function(response) {
					callback(null, 'fetchComments');
				}, function() {
					callback("error", 'fetchComments');
				});
			}, this)
		], _.bind(function(err, results) {
			if (err == null) {
				this.set('fetched', true);
				this.save(true);

				if (success) {
					success();
				}
			}
			else {
				if (error) {
					error();
				}
			}
		}, this));
	},

	// Get movies details
	fetchTranslations: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/translations', {}, _.bind(function(response) {
			// Get user's language or english by default
			var content;
			var index = _.findIndex(response, { language: App.currentUser.get('language') });
			if (index > -1 && response[index].overview != null) {
				content = response[index];
			}
			else {
				index = _.findIndex(response, { language: 'en' });
				content = response[index];
			}

			// Update model
			this.set('overview', content.overview);
			this.set('tagline', content.tagline);
			this.set('title', content.title);

			// Save
			this.save();

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	// Get releases details
	fetchReleasesDates: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/releases', {}, _.bind(function(response) {
			var release;
			var index = _.findIndex(response, { country: App.currentUser.get('country') });
			if (index > -1) {
				release = response[index];
			}
			else {
				index = _.findIndex(response, { country: 'us' });
				release = response[index];
			}

			// Update model
			this.set('release_date', release.release_date);
			this.set('certification', release.certification);

			// Save
			this.save();

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	// Get casting
	fetchCasting: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/people', { extended: 'images' }, _.bind(function(response) {
			// Update model
			this.set('cast', response.cast);
			this.set('crew', response.crew);

			// Save
			this.save();

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	// Get ratings
	fetchRatings: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/ratings', {}, _.bind(function(response) {
			// Update model
			this.set('ratings', response);

			// Save
			this.save();

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	// Get related
	fetchRelated: function(parameters, success, error) {
		var params = { 
			extended: 'images',
			limit: Conf.pagination.limit
		};

		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/related', _.extend(parameters, params), _.bind(function(response) {
			// Update model
			this.set('related', response);

			// Save
			this.save();

			if (success) {
				success(response);
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	},

	// Get comments
	fetchComments: function(parameters, success, error) {
		var params = { 
			extended: 'images',
			limit: Conf.pagination.limit
		};

		ClientREST.get(Conf.traktTV.api_host + '/movies/' + this.get('ids').slug + '/comments', _.extend(parameters, params), _.bind(function(response) {
			// Update model
			this.set('comments', response); // TODO: save comments collection

			// Save
			this.save();

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
	 * Parse User's movies history and set movie seen if present in history
	 */
	setMovieSeenIt: function() {
		// Already view this ?
        var watchedMovies = App.currentUser.get('movies');
        if (watchedMovies) {
        	var found = _.find(watchedMovies, _.bind(function(item) {
        		return item.movie.ids.slug == this.get('ids').slug
        	}, this));
        	
        	if (found) {
        		this.set('seenit', true);
        	}
        }
	},

	/**
	 * Remove the movie from user's history
	 */
	removeFromHistory: function(success, error) {
		var movie = {
			ids: this.get('ids')
		};

		ClientREST.post(Conf.traktTV.api_host + '/sync/history/remove', { movies: [movie] }, _.bind(function(response) {
			if (response.deleted.movies > 0) {
				// Update status
				this.set('seenit', false);

				// Remove from history
				var watchedMovies = App.currentUser.get('movies');
				if (watchedMovies) {
					var index = -1;
					var found = _.find(watchedMovies, _.bind(function(item) {
		    			return item.movie.ids.slug == this.get('ids').slug
		    		}, this));

		    		if (found) {
		    			index = _.indexOf(watchedMovies, found);

		    			// Remove from watched list
		    			watchedMovies.splice(index, 1);
		    		}
				}

				// Save persistant data
				this.save(true);

				if (success) {
					success(response);
				}
			}
			else {
				if (error) {
					error();
				}
			}
		}, this), function(response) {
			if (error) {
				error();
			}
		});
	},

	/** 
	  * Add movie to user's history
	  */
	addToHistory: function(success, error) {

	}
});