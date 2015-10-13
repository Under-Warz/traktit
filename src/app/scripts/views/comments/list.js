var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var CommentView = require('./comment');

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
    }
});