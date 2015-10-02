var Marionnette = require('marionette');

module.exports = Marionette.CompositeView.extend({
    template: require('../../templates/home/show.hbs'),
    tagName: 'li',
    className: 'swipeout',

    initialize: function() {
    	this.model.on('change', this.updateEpisode, this);
    },

    events: {
    	"click .watched-episode": "didWatchedEpisode"
    },

    didWatchedEpisode: function(e) {
    	this.model.watchedLastEpisode(_.bind(function() {
    		// Update next episode
    		this.model.getLastEpisode();
    	}, this));
    },

    updateEpisode: function() {
    	// Hide show from list if no episode left
		if (this.model.get('next_episode') == null) {
			window.f7.swipeoutDelete(this.el);
		}
		else {
    		var next_episode = this.model.get('next_episode');
    		this.$el.find('h3').text('Season ' + next_episode.season + ' - Episode ' + next_episode.number);
		}
    }
});