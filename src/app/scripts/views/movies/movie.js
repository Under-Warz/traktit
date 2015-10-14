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
        App.loader.show();
        if ($(e.currentTarget).hasClass('remove')) {
            this.model.removeFrom(action, function() {
                App.loader.hide();

                $(e.currentTarget).removeClass('remove');
            }, function() {
                App.loader.hide();
            });
        }
        // Check
        else {
            this.model.addTo(action, function() {
                App.loader.hide();

                $(e.currentTarget).addClass('remove');
            }, function() {
                App.loader.hide();
            });
        }

        // Close swipe
        window.f7.swipeoutClose(this.$el);

        e.preventDefault();
        return false;
    }
});