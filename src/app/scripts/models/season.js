var _ = require('underscore');
var Item = require('./item');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');

module.exports = Item.extend({
	initialize:function() {
		// Set this object as movie
		this.set('type', 'seasons');

		// Set if season has been see by user
		this._setSeasonIsSeenIt();

		// Set if season is in user's watchlist
		//this._setMovieIsInWatchlist();

		// Set if movie is in user's movies list
		//this._setMovieIsInCollection();
	},

	// Save movie detail in app and optionnaly in persistant storage
	save: function(persistant) {
		App.seasons[this.get('ids').trakt] = this.toJSON();

		if (persistant) {
			App.savePersistentData('seasons', App.seasons);
		}
	},

	/**
	 * Get all episodes of the season
	 */
	fetchEpisodes: function(showSlug, success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/shows/' + showSlug + '/seasons/' + this.get('number'), { extended: 'images' }, _.bind(function(response) {
			this.set('episodes', response);

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
	  * Add movie to user's history or collection or watchlist
	  */
	addTo: function(action, success, error) {
		var season = {
			ids: this.get('ids')
		};

		ClientREST.post(Conf.traktTV.api_host + '/sync/' + action, { seasons: [season] }, _.bind(function(response) {
			if (response.added.episodes > 0) {

				if (action == 'history') {
					// Update status
					this.set('seenit', true);
					//list = App.currentUser.get('watchedMovies');
				}
				else if (action == 'collection') {
					this.set('inCollection', true);
					//list = App.currentUser.get('collectionMovies');
				}
				else if (action == 'watchlist') {
					this.set('inWatchlist', true);
					//list = App.currentUser.get('watchlist');
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
		var season = {
			ids: this.get('ids')
		};

		ClientREST.post(Conf.traktTV.api_host + '/sync/' + action + '/remove', { seasons: [season] }, _.bind(function(response) {
			if (response.deleted.episodes > 0) {

				var list;

				if (action == 'history') {
					// Update status
					this.set('seenit', false);
					//list = App.currentUser.get('watchedMovies');
				}
				else if (action == 'collection') {
					this.set('inCollection', false);
					//list = App.currentUser.get('collectionMovies');
				}
				else if (action == 'watchlist') {
					this.set('inWatchlist', false);
					//list = App.currentUser.get('watchlist');
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
	 * Parse User's shows history and set movie seen if present in history
	 */
	_setSeasonIsSeenIt: function() {
        var watchedShows = App.currentUser.get('watchedShows');
        if (watchedShows) {
        	var found;
        	_.each(watchedShows, _.bind(function(show) {
        		if (show.show.ids.slug == this.get('showSlug')) {
        			_.each(show.seasons, _.bind(function(season) {
        				if (season.number == this.get('number')) {
							if (season.episodes.length == this.get('episodes').length) {
								found = season;
							}
        				}
        				else {
        					return;
        				}
        			}, this));
        		}
        		else {
        			return;
        		}
        	}, this));
        	
        	if (found) {
        		this.set('seenit', true);
        	}
        }
	},
});