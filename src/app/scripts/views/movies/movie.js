var Marionette = require('marionette');
var App = require('App');

module.exports = Marionette.ItemView.extend({
    template: require('../../templates/movies/movie.hbs'),
    tagName: 'li',
    className: 'swipeout',

    events: {
    	"click .swipeout-content": "showMovie",
        "click .btn-toggle": "toggleAction"
    },

    showMovie: function(e) {
    	if (App.movies[this.model.get('ids').slug] == null) {
    		App.movies[this.model.get('ids').slug] = this.model.toJSON();
    	}

    	window.router.navigate('movies/' + this.model.get('ids').slug, { trigger: true });

    	e.preventDefault();
    	return false;
    },

    /**
     * Add / remove movie from choosen list
     */
    toggleAction: function(e) {
        var action = $(e.currentTarget).data('action');

        // Uncheck
        if ($(e.currentTarget).hasClass('remove')) {
            this.model.removeFrom(action, function() {
                $(e.currentTarget).removeClass('remove');
            });
        }
        // Check
        else {
            this.model.addTo(action, function() {
                $(e.currentTarget).addClass('remove');
            });
        }

        // Close swipe
        window.f7.swipeoutClose(this.$el);

        e.preventDefault();
        return false;
    }
});