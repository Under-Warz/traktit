var _ = require('underscore');
var Backbone = require('backbone');
var ClientREST = require('ClientREST');
var Conf = require('Conf');
var moment = require('moment');

module.exports = Backbone.Model.extend({
	defaults: {
		likes: 0
	},

	initialize: function() {
		// Format likes
		var likes = this.get('likes');
		this.set('likeStr', likes > 1 ? likes + " likes" : likes + " like");

		// Format date
		var created_at = this.get('created_at');
		this.set('formatedCreatedAt', moment(created_at).format('MMM DD, YYYY HH:mm'));
	},

	/**
	 * Post comment
	 */
	post: function(success, error) {
		ClientREST.post(Conf.traktTV.api_host + '/comments', this.toJSON(), _.bind(function(response) {
			if (response.id) {
				// Update model
				this.set(response);

				if (success) {
					success(response);
				}
			}
			else {
				if (error) {
					error();
				}
			}
		}, this), function() {
			if (error) {
				error();
			}
		});
	}
});