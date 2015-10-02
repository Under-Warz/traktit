var Backbone = require('Backbone');
var ClientREST = require('ClientREST');
var Conf = require('Conf');
var moment = require('moment');

module.exports = Backbone.Model.extend({
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
	}
});