var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var Conf = require('Conf');
var Search = require('../../collections/search');
var Movie = require('../../models/movie');
var Show = require('../../models/show');
var MovieView = require('../movies/movie');
var ShowView = require('../home/show'); // TODO : change this

module.exports = ChildCompositeView.extend({
    template: require('../../templates/search/index.hbs'),
    childView: function(obj) {
        if (obj.model instanceof Movie) {
            return new MovieView({model: obj.model});
        }
        else {
            return new ShowView({model: obj.model});
        }
    },
    childViewContainer: ".list-block ul",

    attributes: function() {
        return {
            id: "search",
            class: "page research",
            "data-page": "research"
        }
    },

    initialize: function() {
        this.collection = new Search;
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);

        // Init searchbar
        window.f7.searchbar(this.$el.find('.searchbar'), {
            customSearch: true,
            onSearch: _.bind(function(s) {
                var query = s.query;
                this.collection.search(query);
            }, this)
        });
    }
});