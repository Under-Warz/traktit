var MainCompositeView = require('../mainCompositeView');
var WatchedCollection = require('../../collections/watched');
var ShowView = require('./show');

module.exports = MainCompositeView.extend({
    template: require('../../templates/home/index.hbs'),
    childView: ShowView,
    childViewContainer: ".list-block ul",

    attributes: function() {
        return {
            id: "home",
            class: "page",
            "data-page": "home"
        }
    },

    initialize: function() {
        $('.view.active').removeClass('active');
        $('.view-main').addClass('active');    

        // Init WatchedCollection
        this.collection = new WatchedCollection;

        // Get watched shows
        this.collection.getShows();
    }
});