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
		this.movies = {};
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