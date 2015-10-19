var _ = require('underscore');
var Item = require('./item');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');
var moment = require('moment');
var async = require('async');

module.exports = Item.extend({
	initialize: function() {
		// Set this object as movie
		this.set('type', 'shows');

		/*// Set if movie has been see by user
		this._setMovieIsSeenIt();

		// Set if movie is in user's watchlist
		this._setMovieIsInWatchlist();

		// Set if movie is in user's movies list
		this._setMovieIsInCollection();*/
	},

	// Save movie detail in app and optionnaly in persistant storage
	save: function(persistant) {
		App.shows[this.get('ids').slug] = this.toJSON();

		if (persistant) {
			App.savePersistentData('shows', App.shows);
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
			}, this),
			_.bind(function(callback) {
				this.fetchSeasons(function(response) {
					callback(null, 'fetchSeasons');
				}, function() {
					callback("error", 'fetchSeasons');
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

	/**
	 * Get all seasons of the show
	 */
	fetchSeasons: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/shows/' + this.get('ids').slug + '/seasons', { extended: 'images,episodes' }, _.bind(function(response) {
			// Attach season slug in seasons
			var seasons = [];
			_.each(response, _.bind(function(season) {
				season.showSlug = this.get('ids').slug;
				seasons.push(season);
			}, this));

			this.set('seasons', seasons);

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
	 * Get last episode to watch in the current show
	 */
	getLastEpisode: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/shows/' + this.get('ids').slug + '/progress/watched', {}, _.bind(function(response) {
						
			// Add show in list if has next episode
			if (response.next_episode != null) {
				this.set('next_episode', response.next_episode);
			}
			else {
				this.set('next_episode', null);
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

	/**
	 * Mark last episode as watched
	 */
	watchedLastEpisode: function(success, error) {
		var next_episode = this.get('next_episode');

		if (next_episode) {
			var episode = {
				watched_at: moment().utc().toISOString(),
				ids: {
					trakt: next_episode.ids.trakt
				}
			};

			ClientREST.post(Conf.traktTV.api_host + '/sync/history', { episodes: [episode] }, _.bind(function(response) {
				if (response.added.episodes == 1) {
					if (success) {
						success();
					}
				}
				else {
					if (error) {
						error();
					}
				}
			}, this), function() {
				if (error) {
					error();
				}
			});
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