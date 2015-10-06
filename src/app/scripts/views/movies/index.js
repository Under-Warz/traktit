var MainCompositeView = require('../mainCompositeView');
var MoviesCollection = require('../../collections/movies');
var MovieView = require('./movie.js');
var App = require('App');

module.exports = MainCompositeView.extend({
    template: require('../../templates/movies/index.hbs'),
    childView: MovieView,
    childViewContainer: ".list-block ul",
    currentFilter: null,
    loading: false,
    page: 1,
    previousCollections: {},

    attributes: function() {
        return {
            id: "movies",
            class: "page index",
            "data-page": "movies-index"
        }
    },

    additionalEvents: {
        "infinite .infinite-scroll": "loadNextPage"
    },

    initialize: function() {  
        // Init MoviesCollection
        this.collection = new MoviesCollection;

        // Set default filter (trending)
        this.currentFilter = 'trending';

        // Get movies (trending by default)
        this.collection.getList({
            type: this.currentFilter
        }, {}, _.bind(function() {
            // Save for filter switching
            this.previousCollections.trending = {
                page: this.page,
                models: this.collection.toJSON()
            }
        }, this));

        App.on('selectFilter', _.bind(function(e) {
            var filter = $(e.currentTarget).data('filter');

            // Update filter
            this.currentFilter = filter;

            // Reset list
            this.collection.reset();

            // Check if already loaded content
            if (this.previousCollections[this.currentFilter] != null) {
                this.page = this.previousCollections[this.currentFilter].page;
                this.collection.add(this.previousCollections[this.currentFilter].models);
            }
            else {
                // Reinit page
                this.page = 1;

                // Update list
                this.collection.getList({
                    type: filter
                });
            }

            // Reattach infinite
            window.f7.attachInfiniteScroll(this.$el.find('.infinite-scroll'));

            // Show loader
            this.$el.find('.infinite-scroll-preloader').show();
        }, this));
    },

    onShow: function() {
        MainCompositeView.prototype.onShow.call(this, this, null);

        // Attach infinite scroll
        window.f7.attachInfiniteScroll(this.$el.find('.infinite-scroll'));
    },

    loadNextPage: function() {
        if (this.loading) return;

        this.loading = true;
        this.page++;

        this.collection.getList({ type: this.currentFilter }, { page: this.page }, _.bind(function(response) {
            this.loading = false;

            // Update older array for switching
            var previousCollectionModels = this.previousCollections[this.currentFilter];
            if (previousCollectionModels != null) {
                previousCollectionModels = _.extend(previousCollectionModels, {models: this.collection.toJSON(), page: this.page});
            }
            else {
                this.previousCollections[this.currentFilter] = {
                    models: this.collection.toJSON(),
                    page: this.page
                };
            }

            if (response.length == 0) {
                // Stop infinite scroll
                window.f7.detachInfiniteScroll(this.$el.find('.infinite-scroll'));

                // Remove preloader
                this.$el.find('.infinite-scroll-preloader').hide();
            }

        }, this), _.bind(function() {
            this.loading = false;

            // Stop infinite scroll
            window.f7.detachInfiniteScroll(this.$el.find('.infinite-scroll'));

            // Remove preloader
            this.$el.find('.infinite-scroll-preloader').hide();
        }, this));
    }
});