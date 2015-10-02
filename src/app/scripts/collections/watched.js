var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Show = require('../models/show.js');

module.exports = Backbone.Collection.extend({
	model: Show,
	comparator: function(show) {
		return -Date.parse(show.get('last_watched_at'));
	},

	/**
	 * Get all shows and filter by episode left
	 * @return fill collection with shows
	 */
	getShows: function(success, error) {
		var shows = [];
		var addIndex = 0;
		var addComplete = 0;

		ClientREST.get(Conf.traktTV.api_host + '/sync/watched/shows', { extended: 'images' }, _.bind(function(response) {
			// Populate collection with shows
			if (response) {
				addComplete = response.length;

				_.each(response, _.bind(function(item) {					
					item.show.last_watched_at = item.last_watched_at;

					// Create model
					var show = new Show(item.show);

					// Loop shows and get next episode if not finish
					show.getLastEpisode(_.bind(function() {
						addIndex++;

						// Add show if not completely watched by user
						if (show.get('next_episode')) {
							shows.push(show.toJSON());
						}

						// Add all shows at the end
						if (addIndex == addComplete) {
							this.add(shows);

							if (success) {
								success(response);
							}
						}
					}, this));

				}, this));
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	}
});