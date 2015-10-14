var ChildCompositeView = require('../childCompositeView');
var Conf = require('Conf');
var CommentView = require('./comment');
var AddCommentView = require('./add');

// Model : current movie
module.exports = ChildCompositeView.extend({
    template: require('../../templates/comments/list.hbs'),
    childView: CommentView,
    childViewContainer: ".comments-block",
    loading: false,
    page: 1,
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
        "infinite .infinite-scroll": "loadNextPage"
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);

        // Bind add comment
        $('.add-comment').click(_.bind(this.showAddCommentPopup, this));

        // Recalcul current page
        if (this.collection.models.length) {
            var newPage = Math.ceil(this.collection.models.length / Conf.pagination.limit);
            if (newPage > 1) {
                this.page = newPage;
            }
        }
    },

    /**
     * Open comments popup
     */
    showAddCommentPopup: function(e) {
        new AddCommentView({
            model: this.model,
            collection: this.collection
        });

        e.preventDefault();
        return false;
    },

    /**
     * Load next comments page
     */
    loadNextPage: function() {
        if (this.loading) return;

        this.loading = true;
        this.page++;

        // Load next comments page
        this.model.fetchComments({
            page: this.page
        }, _.bind(function(response) {
            this.loading = false;

            if (response.length) {
                // Append comments in collection
                this.collection.add(response);
            }
            else {
                // Stop infinite scroll
                window.f7.detachInfiniteScroll(this.$el.find('.infinite-scroll'));

                // Remove preloader
                this.$el.find('.infinite-scroll-preloader').hide();
            }
        }, this), _.bind(function() {
            this.loading = false;

            // Stop infinite scroll
            window.f7.detachInfiniteScroll(this.$el.find('.infinite-scroll'));

            // Remove preloader
            this.$el.find('.infinite-scroll-preloader').hide();
        }, this));
    }
});