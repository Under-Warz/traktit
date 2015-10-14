var Marionnette = require('marionette');
var App = require('App');

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

    events: {
        "click .card-content-inner": "removeSpoilerProtection",
        "click .like": "toggleLike"
    },

    initialize: function(options) {
        if (options.movie) {
            this.movie = options.movie;
        }

        this.model.on('likesChanged', this.updateLikesCount, this);
    },

    onRender: function() {
        // Blur comment if spoiler
        if (this.model.get('spoiler')) {
            this.$el.addClass('spoiler-alert');
        }
    },

    removeSpoilerProtection: function(e) {
        this.$el.removeClass('spoiler-alert');
    },

    /**
     * Like / unlike comment
     */
    toggleLike: function(e) {
        var btn = $(e.currentTarget);
        App.loader.show();

        if (btn.hasClass('liked')) {
            this.model.unlike(function() {
                App.loader.hide();
                btn.removeClass('liked');
            }, function() {
                App.loader.hide();
            });
        }
        else {
            this.model.like(function() {
                App.loader.hide();
                btn.addClass('liked');
            }, function() {
                App.loader.hide();
            });
        }

        e.preventDefault();
        return false;
    },

    /**
     * Update likes count on like
     */
    updateLikesCount: function() {
        // Update txt
        this.$el.find('.like').text(this.model.get('likeStr'));

        // Update movie's comments collection
        this.movie.set('comments', this.model.collection.toJSON());
    }
});