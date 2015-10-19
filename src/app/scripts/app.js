var Marionette = require('marionette');
var User = require('./models/user.js');

var App = Marionette.Application.extend({
	currentUser: null,
	movies: null, // List of movies previously loaded
	shows: null, // List of shows previously loaded
	seasons: null, // List of seasons previously loaded
	loader: null, // Common loader
	
	initialize: function(options) {
		// Check if user token is in localStorage
		var userData = localStorage.getItem("currentUser");
		if (userData) {
			this.currentUser = new User(JSON.parse(userData));
		}

		// Init movies
		var movies = this.getPersistentData('movies');
		if (movies) {
			this.movies = JSON.parse(movies);
		}
		else {
			this.movies = {};
		}

		// Init shows
		var shows = this.getPersistentData('shows');
		if (shows) {
			this.shows = JSON.parse(shows);
		}
		else {
			this.shows = {};
		}

		// Init seasons
		var seasons = this.getPersistentData('seasons');
		if (seasons) {
			this.seasons = JSON.parse(seasons);
		}
		else {
			this.seasons = {};
		}
  	},

  	savePersistentData: function(key, value) {
  		if (window.cordova) {

  		}
  		else {
			// Save in localStorage
			localStorage.setItem(key, JSON.stringify(value));	
  		}
  	},

  	getPersistentData: function(key) {
  		if (window.cordova) {

  		}
  		else {
  			var data = localStorage.getItem(key);
  			return data;
  		}
  	}
});

var app = new App({
	container: '.app-container'
});

// Add main region
app.addRegions({
	mainContainer: app.container
});

module.exports = app;