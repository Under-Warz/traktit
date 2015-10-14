var PopupView = require('../popup');
var Comment = require('../../models/comment');

// Model : single movie
// Collection : comments of movie
module.exports = PopupView.extend({
    id: 'popup-add-comment',
    template: require('../../templates/comments/add.hbs'),

    additionalEvents: {
    	"click .finish": "postComment"
    },

    onRender: function() {
    	PopupView.prototype.onRender.call(this, this, null);

    	// Active resizable textarea
        window.f7.initPageResizableTextareas(this.$el);
    },

	postComment: function(e) {
		var movie = {
			ids: this.model.get('ids')
		};

		var comment = this.$el.find('textarea[name="comment"]').val();

		// Check comment size
		if (comment.split(' ').length < 5) {
			alert('must be 5 word least');
		}
		else {
			var commentObj = new Comment({
				movie: movie,
				comment: comment,
				spoiler: this.$el.find('input[name="spoiler"]').is(':checked')
			});

			commentObj.post(_.bind(function(response) {
				// Append comment in movie & collection
				this.collection.add(commentObj.toJSON());

				this.model.get('comments').push(commentObj.toJSON());
				this.model.save(true);

				this.closePopup();
			}, this), function(response) {
				if (response.errors) {
					alert(response.errors.comment);
				}
			});
		}

		e.preventDefault();
		return false;
	}    
});