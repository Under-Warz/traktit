var _ = require('underscore');
var Item = require('./item');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var App = require('App');

module.exports = Item.extend({
	initialize:function() {
		// Set this object as movie
		this.set('type', 'seasons');
	},

	// Save movie detail in app and optionnaly in persistant storage
	save: function(persistant) {
		App.seasons[this.get('ids').trakt] = this.toJSON();

		if (persistant) {
			App.savePersistentData('seasons', App.seasons);
		}
	},

	fetch: function(showSlug, success, error) {
		this.fetchEpisodes(showSlug, _.bind(function(response) {
			this.set('fetched', true);

			this.save(true);

			if (success) {
				success(response);
			}
		}, this), _.bind(function() {
			if (error) {
				error();
			}
		}, this));
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
	}
});