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

					// Loop shows and get next episode if not finish
					var slug = item.show.ids.slug;

					ClientREST.get(Conf.traktTV.api_host + '/shows/' + slug + '/progress/watched', {}, _.bind(function(response) {
						
						// Add show in list if has next episode
						if (response.next_episode != null) {
							item.show.next_episode = response.next_episode;

							shows.push(item.show);
						}

						addIndex++;

						// Add all shows at the end
						if (addIndex == addComplete) {
							this.add(shows);

							if (success) {
								success(response);
							}
						}

					}, this), function() {
						addIndex++;
					});

				}, this));
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	}
});