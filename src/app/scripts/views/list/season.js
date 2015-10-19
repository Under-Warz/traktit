var Marionette = require('marionette');
var App = require('App');

module.exports = Marionette.ItemView.extend({
    template: require('../../templates/list/season.hbs'),
    tagName: 'li',
    className: 'swipeout show',
    show: null,

    events: {
    	"click .swipeout-content": "showSeason",
        "click .btn-toggle": "toggleAction"
    },

    initialize: function(options) {
        if (options.show) {
            this.show = options.show;
        }
    },

    serializeData: function() {
        return this.model.toJSON();
    },

    showSeason: function(e) {
        if (App.seasons[this.model.get('ids').trakt] == null) {
            App.seasons[this.model.get('ids').trakt] = this.model.toJSON();
        }

    	window.router.navigate('shows/' + this.show.get('ids').slug + '/season/' + this.model.get('number'), { trigger: true });

    	e.preventDefault();
    	return false;
    },

    /**
     * Add / remove movie from choosen list
     */
    toggleAction: function(e) {
        /*var action = $(e.currentTarget).data('action');

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
        window.f7.swipeoutClose(this.$el);*/

        e.preventDefault();
        return false;
    }
});