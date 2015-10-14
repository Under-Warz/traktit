var ChildItemView = require('../childItemView');
var App = require('App');
var Conf = require('Conf');

module.exports = ChildItemView.extend({
    template: require('../../templates/search/index.hbs'),

    attributes: function() {
        return {
            id: "search",
            class: "page research",
            "data-page": "research"
        }
    },

    initialize: function() {
        
    },

    onShow: function() {
        ChildItemView.prototype.onShow.call(this, this, null);

        // Init searchbar
        window.f7.searchbar(this.$el.find('.searchbar'), {
            customSearch: true,
            onSearch: function(s) {
                var search = s.query;
            }
        });
    }
});