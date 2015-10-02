var Marionnette = require('marionette');

module.exports = Marionette.CompositeView.extend({
    template: require('../../templates/home/show.hbs'),
    tagName: 'li',
    className: 'swipeout',

    initialize: function() {
    	this.model.on('change', this.render, this);
    },

    events: {
    	"click .watched-episode": "didWatchedEpisode"
    },

    didWatchedEpisode: function(e) {
    	this.model.watchedLastEpisode(_.bind(function() {
    		// Update next episode
    		this.model.getLastEpisode(_.bind(function() {
    			console.log(this.model);
    		}, this));
    	}, this));
    }
});