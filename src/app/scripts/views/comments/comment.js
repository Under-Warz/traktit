var Marionnette = require('marionette');

module.exports = Marionette.ItemView.extend({
    template: require('../../templates/comments/comment.hbs'),
    tagName: 'div',
    movie: null,
    attributes: function() {
        return {
            class: "card facebook-card"
        }
    },
    templateHelpers: function() {
        return {
            getMovieSlug: _.bind(function() {
                return this.movie.get('ids').slug;
            }, this)
        }
    },

    initialize: function(options) {
        if (options.movie) {
            this.movie = options.movie;
        }
    }
});