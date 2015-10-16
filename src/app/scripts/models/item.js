var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');
var moment = require('moment');

module.exports = Backbone.Model.extend({
	defaults: {
		fetched: false,
		seenit: false,
		inWatchlist: false,
		inCollection: false,
		type: null
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

	// Get movies details
	fetchTranslations: function(success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/translations', {}, _.bind(function(response) {
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
		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/releases', {}, _.bind(function(response) {
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
		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/people', { extended: 'images' }, _.bind(function(response) {
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
		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/ratings', {}, _.bind(function(response) {
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

		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/related', _.extend(parameters, params), _.bind(function(response) {
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

		ClientREST.get(Conf.traktTV.api_host + '/' + this.get('type') + '/' + this.get('ids').slug + '/comments', _.extend(parameters, params), _.bind(function(response) {
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
	}
});