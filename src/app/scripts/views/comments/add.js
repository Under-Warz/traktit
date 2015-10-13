var PopupView = require('../popup');
var Comment = require('../../models/comment');

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

		var comment = new Comment({
			movie: movie,
			comment: this.$el.find('textarea[name="comment"]').val()
		});

		comment.post(_.bind(function(response) {
			this.closePopup();
		}, this), function() {
			alert('Error');
		});

		e.preventDefault();
		return false;
	}    
});