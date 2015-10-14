var ChildItemView = require('../childItemView');
var App = require('App');
var Conf = require('Conf');
var moment = require('moment');

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
        "click .btn-toggle": "toggleAction",
        "click .related .swiper-slide": "showRelatedMovie",
        "click .show-comments": "showComments",
        "click .btn-rate": "showRatePicker",
        "click .btn-share": "shareMovie"
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
     * Toggle movie action (history, collection, watchlist)
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
    },

    /**
     * Show rating picker
     */
    showRatePicker: function(e) {
        var values = [
            '1 - Weak sauce :(',
            '2 - Terrible',
            '3 - Bad',
            '4 - Poor',
            '5 - Meh',
            '6 - Fair',
            '7 - Good',
            '8 - Great',
            '9 - Superb',
            '10 - Totally ninja!'
        ];

        var picker = window.f7.picker({
            rotateEffect: true,
            toolbarTemplate: require('../../templates/partials/rate_toolbar.hbs')(),
            cols: [
                {
                    textAlign: 'center',
                    values: values
                }
            ],
            onOpen: _.bind(function(picker) {
                picker.container.find('.done').click(_.bind(function() {
                    var value = _.indexOf(values, picker.value[0]);
                    this.saveRating(picker, value);
                }, this));
            }, this)
        });

        picker.open();

        e.preventDefault();
        return false;
    },

    saveRating: function(picker, value) {
        var movie = {
            rated_at: moment().utc().toISOString(),
            rating: value,
            ids: this.model.get('ids')
        };

        App.loader.show();
        App.currentUser.postRating({ movies: [movie] }, _.bind(function(response) {
            App.loader.hide();

            // Close picker
            picker.close();
            
        }, this), function() {
            App.loader.hide();
        });
    },

    /**
     * Share the movie
     */
    shareMovie: function(e) {
        if (window.cordova) {
            window.plugins.socialsharing.share(this.model.get('title') + '-' + this.model.get('year'), Conf.appname, null, "http://www.trakt.tv/movies/" + this.model.get('ids').slug);
        }

        e.preventDefault();
        return false;
    }
});