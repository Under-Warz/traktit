var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var Conf = require('Conf');
var Search = require('../../collections/search');
var Movie = require('../../models/movie');
var Show = require('../../models/show');
var MovieView = require('../movies/movie');
var ShowView = require('../shows/show');

module.exports = ChildCompositeView.extend({
    template: require('../../templates/search/index.hbs'),
    childView: function(obj) {
        if (obj.model instanceof Movie) {
            return new MovieView({model: obj.model});
        }
        else {
            return new ShowView({model: obj.model});
        }
    },
    childViewContainer: ".list-block ul",
    loading: false,
    page: 1,
    query: null,

    additionalEvents: {
        "infinite .infinite-scroll": "loadNextPage",
        "keypress input[name='search']": "makeSearch",
        "click .filters .button": "filterResult"
    },

    attributes: function() {
        return {
            id: "search",
            class: "page research",
            "data-page": "research"
        }
    },

    initialize: function() {
        this.collection = new Search;
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);

        // Init searchbar
        window.f7.searchbar(this.$el.find('.searchbar'), {
            customSearch: true,
            onSearch: _.bind(function(s) {
                this.query = s.query;
            }, this)
        });

        // Hide loader
        this.$el.find('.infinite-scroll-preloader').hide();
    },

    /**
     * Perform search
     */
    makeSearch: function(e) {
        if (this.query != "" && this.query != null) {
            if (e.keyCode == 13) {
                // Scroll top
                this.$el.find('.page-content').scrollTop(0);

                // Reinit page
                this.page = 1;

                // Reattach infinite
                window.f7.attachInfiniteScroll(this.$el.find('.infinite-scroll'));  

                var searchbar = this.$el.find('.searchbar')[0].f7Searchbar;

                App.loader.show();
                this.collection.search({ page: 1, query: this.query }, function() {
                    App.loader.hide();
                }, function() {
                    App.loader.hide();
                });
            }
        }
    },

    /**
     * Pagination
     */
    loadNextPage: function() {
        if (this.loading) return;

        this.loading = true;
        this.page++;

        this.collection.search({ query: this.query, page: this.page }, _.bind(function(response) {
            this.loading = false;

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
    },

    /**
     * Filter results / show movie or shows only
     */
    filterResult: function(e) {
        var btn = $(e.currentTarget),
            list = this.$el.find('.list-block'),
            filter;

        if (btn.hasClass('active')) {
            btn.removeClass('active');    
        }
        else {
            btn.parent().find('.active').removeClass('active');
            btn.addClass('active');
            filter = btn.data('filter');
        }

        if (filter) {
            list.removeClass('show-shows show-movies');
            list.addClass('show-' + filter);
        }
        else {
            list.removeClass('show-shows show-movies');
        }
    }
});