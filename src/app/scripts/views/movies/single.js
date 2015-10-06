var ChildItemView = require('../childItemView');
var App = require('App');

module.exports = ChildItemView.extend({
    template: require('../../templates/movies/single.hbs'),

    initialize: function() {
        // Load movie
        if (this.model.get('fetched') == false) {
            this.model.fetch(function() {
                console.log('fetched !!!');
            });
        }

        // Reload
        this.model.on('change', this.update, this);
    },

    update: function() {
        _.each(this.$el.find('#movies-single *[data-attr]'), _.bind(function(elm) {
            $(elm).empty().html(this.model.get($(elm).data('attr')));
        }, this));
    }
});