var ChildItemView = require('../childItemView');
var App = require('App');

module.exports = ChildItemView.extend({
    template: require('../../templates/movies/single.hbs'),
    castSwiper: null,
    relatedSwiper: null,

    attributes: function() {
        return {
            id: "movies-single",
            class: "page single",
            "data-page": "movies-single"
        }
    },

    initialize: function() {
        // Load movie
        if (this.model.get('fetched') == false) {
            this.model.fetch(_.bind(function() {
                this.render();
            }, this));
        }
    },

    additionalEvents: {
        "click .btn-check": "toggleCheck",
        "click .related .swiper-slide": "showRelatedMovie"
    },

    onRender: function() {
        setTimeout(_.bind(function() {
            // Render casting
            if (this.model.get('cast')) {
                this.castSwiper = window.f7.swiper(this.$el.find('.cast'), {
                    slidesPerView: 'auto',
                    preventClicks: true
                });
            }

            // Render related
            if (this.model.get('related')) {
                this.relatedSwiper = window.f7.swiper(this.$el.find('.related'), {
                    slidesPerView: 'auto',
                    preventClicks: true
                });
            }
        }, this), 500);
    },

    /**
     * Check / uncheck movie
     */
    toggleCheck: function(e) {
        // Uncheck
        if ($(e.currentTarget).hasClass('uncheck')) {
            this.model.removeFromHistory(function() {
                $(e.currentTarget).removeClass('uncheck');
            });
        }
        // Check
        else {
            this.model.addToHistory(function() {
                $(e.currentTarget).addClass('uncheck');
            });
        }

        e.preventDefault();
        return false;
    },

    /**
     * Show related movie
     */
    showRelatedMovie: function(e) {
        var index = this.$el.find('.related .swiper-slide').index(e.currentTarget);
        var relatedMovie = this.model.get('related')[index];

        if (App.movies[relatedMovie.ids.slug] == null) {
            App.movies[relatedMovie.ids.slug] = relatedMovie;
        }

        window.router.navigate('movies/' + relatedMovie.ids.slug, { trigger: true });

        e.preventDefault();
        return false;
    }
});