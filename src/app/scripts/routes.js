require('backbone');
require('marionette');

var App = require('App');
var MainLayout = require('./views/layouts/main.js');

var HomeView = require('./views/home/index.js');
var LoginView = require('./views/login/login.js');

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
        "login": "getLogin"
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