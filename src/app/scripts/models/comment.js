var _ = require('underscore');
var Backbone = require('backbone');
var ClientREST = require('ClientREST');
var Conf = require('Conf');
var App = require('App');
var moment = require('moment');

module.exports = Backbone.Model.extend({
	defaults: {
		likes: 0,
		spoiler: false,
		liked: false
	},

	initialize: function() {
		// Format likes
		this._formatLikes();

		// Format date
		var created_at = this.get('created_at');
		this.set('formatedCreatedAt', moment(created_at).format('MMM DD, YYYY HH:mm'));

		// Check if user liked this comment
		this._setCommentLiked();
	},

	/**
	 * Post comment
	 */
	post: function(success, error) {
		ClientREST.post(Conf.traktTV.api_host + '/comments?extended=images', this.toJSON(), _.bind(function(response) {
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
		}, this), function(response) {
			if (error) {
				error(response);
			}
		});
	},

	/**
	 * Like a comment
	 */
	like: function(success, error) {
		ClientREST.post(Conf.traktTV.api_host + '/comments/' + this.get('id') + '/like', {}, _.bind(function() {
			// Increase count like
			var likes = this.get('likes');
			this.set('likes', likes + 1);
			this._formatLikes();

			// Mark as liked
			this.set('liked', true);

			// Call trigger
			this.trigger('likesChanged');

			// Add like to local comments likes list
			var commentsLikes = App.currentUser.get('commentsLikes');
			if (commentsLikes) {
				commentsLikes.push({
					type: 'comment',
					liked_at: moment().utc().toISOString(),
					comment: this.toJSON()
				});
			}

			if (success) {
				success();
			}
		}, this), function(response) {
			if (error) {
				error(response);
			}
		});
	},

	/**
	 * Unlike a comment
	 */
	unlike: function(success, error) {
		ClientREST.delete(Conf.traktTV.api_host + '/comments/' + this.get('id') + '/like', {}, _.bind(function() {
			// Decrease count like
			var likes = this.get('likes');
			this.set('likes', likes - 1);
			this._formatLikes();

			// Mark as liked
			this.set('liked', false);

			// Call trigger
			this.trigger('likesChanged');

			// Remove from local comments likes
			var commentsLikes = App.currentUser.get('commentsLikes');
			if (commentsLikes) {
				var index = -1;
				var found = _.find(commentsLikes, _.bind(function(item) {
	    			return item.comment.id == this.get('id');
	    		}, this));

	    		if (found) {
	    			index = _.indexOf(commentsLikes, found);

	    			// Remove it if found
	    			commentsLikes.splice(index, 1);
	    		}
			}

			if (success) {
				success();
			}
		}, this), function(response) {
			if (error) {
				error(response);
			}
		});
	},

	/**
	 * Private methods 
	 */

	_formatLikes: function() {
		var likes = this.get('likes');
		this.set('likeStr', likes > 1 ? likes + " likes" : likes + " like");
	},

	/**
	 * Set the comment as liked if user liked it
	 */
	_setCommentLiked: function() {
		var likes = App.currentUser.get('commentsLikes');
        if (likes) {
        	var found = _.find(likes, _.bind(function(item) {
    			return item.comment.id == this.get('id');
        	}, this));
        	
        	if (found) {
        		this.set('liked', true);
        	}
        }
	},
});