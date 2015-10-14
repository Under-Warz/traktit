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
        // Load movie if no data loaded previously or in storage
        if (this.model.get('fetched') == false) {
            App.loader.show();
            this.model.fetch(_.bind(function() {
                App.loader.hide();
                this.render();
            }, this), function() {
                App.loader.hide();
            });
        }
    },

    additionalEvents: {
        "click .btn-check": "toggleCheck",
        "click .related .swiper-slide": "showRelatedMovie",
        "click .show-comments": "showComments"
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
    },

    /**
     * Show comments
     */
    showComments: function(e) {
        // Load movie's comment if not loaded yet
        if (!this.model.has('comments')) {
            App.loader.show();
            this.model.fetchComments({}, _.bind(function(response) {
                App.loader.hide();
                window.router.navigate($(e.currentTarget).attr('href'), { trigger: true });
            }, this), function() {
                App.loader.hide();
                alert('Cannot load comments');
            });
        }
        else {
            window.router.navigate($(e.currentTarget).attr('href'), { trigger: true });
        }

        e.preventDefault();
        return false;
    }
});