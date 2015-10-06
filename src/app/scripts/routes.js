require('backbone');
require('marionette');

var App = require('App');
var MainLayout = require('./views/layouts/main');

var HomeView = require('./views/home/index');
var LoginView = require('./views/login/login');
var MoviesIndex = require('./views/movies/index');
var MovieSingle = require('./views/movies/single');

var Movie = require('./models/movie');

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
        "login": "getLogin",
        "movies": "getMovies",
        "movies/:slug": "getSingleMovie"
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

    /* Login */
    getLogin: function() {
        var page = new LoginView;
        this.layout.loginView.show(page);
    },

    /* Movies */
    getMovies: function() {
        var page = new MoviesIndex;
        this.layout.moviesView.show(page);
    },

    getSingleMovie: function(slug) {
        var page = new MovieSingle({
            model: new Movie(App.movies[slug])
        });
        this.layout.moviesView.addView(page);
    },

    /** Helpers **/
    isAuthenticate: function() {
        if (App.currentUser == null) {
            return false;
        }
        else {
            return true;
        }
    }
});