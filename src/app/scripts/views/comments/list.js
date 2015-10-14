var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var CommentView = require('./comment');
var AddCommentView = require('./add');

module.exports = ChildCompositeView.extend({
    template: require('../../templates/comments/list.hbs'),
    childView: CommentView,
    childViewContainer: ".comments-block",
    childViewOptions: function() {
        return {
            movie: this.model
        }
    },

    attributes: function() {
        return {
            id: "comments",
            class: "page comments",
            "data-page": "comments"
        }
    },

    additionalEvents: {
        
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);

        // Bind add comment
        $('.add-comment').click(_.bind(this.showAddCommentPopup, this));
    },

    showAddCommentPopup: function(e) {
        new AddCommentView({
            model: this.model,
            collection: this.collection
        });

        e.preventDefault();
        return false;
    }
});