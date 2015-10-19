require('backbone');
require('marionette');

var App = require('App');
var MainLayout = require('./views/layouts/main');

var HomeView = require('./views/home/index');
var SearchView = require('./views/search/index');
var LoginView = require('./views/login/login');
var ListIndex = require('./views/list/index');
var MovieSingle = require('./views/movies/single');
var ShowSingle = require('./views/shows/single');
var SeasonSingle = require('./views/shows/season');
var CommentsView = require('./views/comments/list');

var Movie = require('./models/movie');
var Show = require('./models/show');
var Season = require('./models/season');
var Comments = require('./collections/comments');

module.exports = Marionette.AppRouter.extend({
    layout: null,
    currentPage: null,

    initialize: function() {
        this.layout = new MainLayout();
        App.mainContainer.show(this.layout);

        // Delete old views when empty a region
        // ex : this.layout.REGIONNAME.on('empty', _.bind(this.clearOldViews, this));
    },

    clearOldViews: function(view, region, options) {
        if (this.oldViews) {
            _.each(this.oldViews, function(view) {
                view.destroy();
            });
            this.oldViews = [];
        }
    },

    navigate: function (url) {
        // Disable changing URL
        Backbone.history.loadUrl(url);
    },

    routes: {
        "": "getHome",
        "search": "getSearch",
        "login": "getLogin",
        "movies": "getMovies",
        "movies/:slug": "getSingleMovie",
        "movies/:slug/comments": "getMovieComments",
        "shows": "getShows",
        "shows/:slug": "getSingleShow",
        "shows/:slug/comments": "getShowComments",
        "shows/:slug/season/:season": "getSingleSeason"
    },

    /* Routes */
    getHome: function () {
        if (!this.isAuthenticate()) {
            this.navigate('login', { trigger: true });    
        }
        else {
            var page = new HomeView;
            this.layout.mainView.show(page);
        }
    },

    /* Search */
    getSearch: function() {
        var page = new SearchView;
        this.layout.mainView.show(page, {
            preventDestroy: true
        });
    },

    /* Login */
    getLogin: function() {
        var page = new LoginView;
        this.layout.loginView.show(page);
    },

    /* Movies */
    getMovies: function() {
        var page = new ListIndex({
            type: 'movies'
        });
        this.layout.moviesView.show(page);
    },

    getSingleMovie: function(slug) {
        var page = new MovieSingle({
            model: new Movie(App.movies[slug])
        });
        this.getActiveView().show(page, {
            preventDestroy: true
        });
    },

    getMovieComments: function(slug) {
        var page = new CommentsView({
            model: new Movie(App.movies[slug]),
            collection: new Comments(App.movies[slug].comments)
        });
        this.getActiveView().show(page, {
            preventDestroy: true
        });
    },

    /* Shows */
    getShows: function() {
        var page = new ListIndex({
            type: 'shows'
        });
        this.layout.showsView.show(page);
    },

    getSingleShow: function(slug) {
        var page = new ShowSingle({
            model: new Show(App.shows[slug])
        });
        this.getActiveView().show(page, {
            preventDestroy: true
        });
    },

    getShowComments: function(slug) {
        var page = new CommentsView({
            model: new Show(App.shows[slug]),
            collection: new Comments(App.shows[slug].comments)
        });
        this.getActiveView().show(page, {
            preventDestroy: true
        });
    },

    getSingleSeason: function(slug, season) {
        var page = new SeasonSingle({
            model: new Show(App.shows[slug]),
            number: season
        });
        this.getActiveView().show(page, {
            preventDestroy: true
        });
    },

    /** Helpers **/
    isAuthenticate: function() {
        if (App.currentUser == null) {
            return false;
        }
        else {
            return true;
        }
    },

    getActiveView: function() {
        var activeView = $('.view.active');

        if (activeView.hasClass('view-main')) {
            return this.layout.mainView;
        }
        else if (activeView.hasClass('view-login')) {
            return this.layout.loginView;
        }
        else if (activeView.hasClass('view-movies')) {
            return this.layout.moviesView;
        }
        else if (activeView.hasClass('view-shows')) {
            return this.layout.showsView;
        }
    }
});