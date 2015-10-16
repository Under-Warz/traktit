var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');
var async = require('async');
var moment = require('moment');

module.exports = Backbone.Model.extend({
	defaults: {
		fetched: false,
		seenit: false,
		inWatchlist: false,
		inCollection: false
	},

	initialize: function() {
		// Set if movie has been see by user
		this._setMovieIsSeenIt();

		// Set if movie is in user's watchlist
		this._setMovieIsInWatchlist();

		// Set if movie is in user's movies list
		this._setMovieIsInCollection();
	},

	toJSON: function() {
		// Set banner image
		var banner;
		if (this.get('images').thumb) {
			banner = this.get('images').thumb.full;
		}
		else {
			banner = this.get('images').fanart.medium;
		}
		this.set('banner', banner);

		var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
        return json;
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
				this.fetchOMDBDatas(function(response) {
					callback(null, 'fetchOMDBDatas');
				}, function() {
					callback("error", 'fetchOMDBDatas');
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
			if (response.length > 0) {
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
			}

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
			if (response.length > 0) {
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
			}

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
			if (response) {
				// Update model
				this.set('cast', response.cast);
				//this.set('crew', response.crew);
			}

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
			if (response) {
				// Update model
				this.set('ratings', response);
			}

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
			if (response) {
				// Update model
				this.set('related', response);
			}

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
			if (response) {
				if (this.get('comments')) {
					// Merge comments with new ones
					var comments = this.get('comments').concat(response);
					this.set('comments', comments);
				}
				else {
					// Update model
					this.set('comments', response);
				}
			}

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

	// Get OMDB's data
	fetchOMDBDatas: function(success, error) {
		var imdbID = this.get('ids').imdb;

		if (imdbID) {
			ClientREST.get(Conf.omdb.api_host, { i: imdbID }, _.bind(function(response) {
				if (response) {
					this.set('director', response.Director);
					this.set('genres', response.Genre.split(', '));
					this.set('language', response.Language);
					this.set('runtime', response.Runtime);

					// Save
					this.save();
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
		else {
			if (error) {
				error();
			}
		}
	},

	/** 
	  * Add movie to user's history or collection or watchlist
	  */
	addTo: function(action, success, error) {
		var movie = {
			ids: this.get('ids')
		};

		ClientREST.post(Conf.traktTV.api_host + '/sync/' + action, { movies: [movie] }, _.bind(function(response) {
			if (response.added.movies > 0) {

				if (action == 'history') {
					// Update status
					this.set('seenit', true);
					list = App.currentUser.get('watchedMovies');
				}
				else if (action == 'collection') {
					this.set('inCollection', true);
					list = App.currentUser.get('collectionMovies');
				}
				else if (action == 'watchlist') {
					this.set('inWatchlist', true);
					list = App.currentUser.get('watchlist');
				}

				// Add to local history
				if (list) {
					list.push({
						plays: 1,
						last_watched_at: moment().utc().toISOString(),
						movie: {
							title: this.get('title'),
							year: this.get('year'),
							ids: this.get('ids'),
							images: this.get('images')
						}
					});
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
	 * Remove the movie from user's history or collection or watchlist
	 */
	removeFrom: function(action, success, error) {
		var movie = {
			ids: this.get('ids')
		};

		ClientREST.post(Conf.traktTV.api_host + '/sync/' + action + '/remove', { movies: [movie] }, _.bind(function(response) {
			if (response.deleted.movies > 0) {

				var list;

				if (action == 'history') {
					// Update status
					this.set('seenit', false);
					list = App.currentUser.get('watchedMovies');
				}
				else if (action == 'collection') {
					this.set('inCollection', false);
					list = App.currentUser.get('collectionMovies');
				}
				else if (action == 'watchlist') {
					this.set('inWatchlist', false);
					list = App.currentUser.get('watchlist');
				}

				// Remove from local list
				if (list) {
					var index = -1;
					var found = _.find(list, _.bind(function(item) {
						if (item.movie) {
		    				return item.movie.ids.slug == this.get('ids').slug
		    			}
		    			else {
		    				return false;
		    			}
		    		}, this));

		    		if (found) {
		    			index = _.indexOf(list, found);

		    			// Remove it if found
		    			list.splice(index, 1);
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
	 * Private methods
	 */


	/**
	 * Parse User's movies history and set movie seen if present in history
	 */
	_setMovieIsSeenIt: function() {
        var watchedMovies = App.currentUser.get('watchedMovies');
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
	 * Parse User's movie watchlist and set movie in list if present
	 */
	_setMovieIsInWatchlist: function() {
        var watchlist = App.currentUser.get('watchlist');
        if (watchlist) {
        	var found = _.find(watchlist, _.bind(function(item) {
        		if (item.movie) {
        			return item.movie.ids.slug == this.get('ids').slug
        		}
        	}, this));
        	
        	if (found) {
        		this.set('inWatchlist', true);
        	}
        }
	},

	/** 
	 * Parse User's movie watchlist and set movie in list if present
	 */
	_setMovieIsInCollection: function() {
        var moviesCollection = App.currentUser.get('collectionMovies');
        if (moviesCollection) {
        	var found = _.find(moviesCollection, _.bind(function(item) {
    			return item.movie.ids.slug == this.get('ids').slug
        	}, this));
        	
        	if (found) {
        		this.set('inCollection', true);
        	}
        }
	}
});