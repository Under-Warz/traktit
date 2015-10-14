var Marionnette = require('marionette');

module.exports = Marionnette.ItemView.extend({
    template: require('../templates/loader.hbs'),
    className: 'loader',
    tl: null,
    in: null,

    initialize: function(options) {
        this.in = options.in;

        this.render();
        this.in.append(this.$el);
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    }
});