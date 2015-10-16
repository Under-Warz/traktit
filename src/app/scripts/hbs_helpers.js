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

	// Join helpers
	Handlebars.registerHelper( "join", function( array, sep, options ) {
		if (array) {
	    	return array.map(function( item ) {
	        	return options.fn( item );
	    	}).join( sep );
	    }
	});

	Handlebars.registerPartial("actor", require('./templates/partials/actor_slider.hbs'));

	Handlebars.registerPartial("movie", require('./templates/partials/movie_slider.hbs'));

	Handlebars.registerPartial("summary", require('./templates/partials/single_summary.hbs'));
	Handlebars.registerPartial("relationships", require('./templates/partials/single_relationships.hbs'));
}

module.exports = initialize();