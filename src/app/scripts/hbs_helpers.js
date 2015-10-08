var Handlebars = require('hbsfy/runtime');

/**
 * Register all your Handlebars helpers / partials
 */
function initialize() {
	// Each with limit
	Handlebars.registerHelper('limit', function (arr, limit) {
	    if (!_.isArray(arr)) { return []; } // remove this line if you don't want the lodash/underscore dependency
	    return arr.slice(0, limit);
	});

	Handlebars.registerPartial("actor", require('./templates/partials/actor_slider.hbs'));

	Handlebars.registerPartial("movie", require('./templates/partials/movie_slider.hbs'));
}

module.exports = initialize();