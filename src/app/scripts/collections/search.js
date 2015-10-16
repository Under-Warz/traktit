var _ = require('underscore');
var Backbone = require('backbone');
var Conf = require('Conf');
var ClientREST = require('ClientREST');
var Movie = require('../models/movie');
var Show = require('../models/show');

module.exports = Backbone.Collection.extend({
	model: function(attrs, options) {
		switch(attrs.type) {
	    	case "movie":
	        	return new Movie(attrs.movie, options);
	      	default:
	        	return new Show(attrs.show, options);
	    }
	},

	search: function(params, success, error) {
		ClientREST.get(Conf.traktTV.api_host + '/search', _.extend(params, { limit: Conf.pagination.limit, type: "movie,show", extended: "images" }), _.bind(function(response) {
			// Empty collection first
			if (params.page == 1) {
				this.reset();
			}

			if (response.length) {
				this.add(response);
			}

    		if (success) {
    			success(response);
    		}
        }, this), function() {
			if (error) {
				error();
			}
        });
	}
});