var Marionette = require('marionette');
var User = require('./models/user.js');

var App = Marionette.Application.extend({
	currentUser: null,
	movies: null,
	
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