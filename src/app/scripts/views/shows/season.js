var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var Conf = require('Conf');
var ActionBar = require('../partials/single_actionbar');
var EpisodeView = require('../list/episode');
var EpisodesCollection = require('../../collections/episodes');
var Season = require('../../models/season');

module.exports = ChildCompositeView.extend({
    template: require('../../templates/shows/season.hbs'),
    childView: EpisodeView,
    childViewContainer: ".episodes ul",
    actionBar: null,
    number: null,
    show: null,

    attributes: function() {
        return {
            id: "season-single",
            class: "page single",
            "data-page": "season-single"
        }
    },

    initialize: function(options) {
        // Construct season collection
        this.collection = new EpisodesCollection;  

        // Get current season number
        this.number = options.number;

        // Get current season
        this.show = options.show;

        // Load movie if no data loaded previously or in storage
        if (this.model.get('fetched') == false) {
            App.loader.show();
            this.model.fetch(this.show.get('ids').slug, _.bind(function() {
                App.loader.hide();

                // Construct season collection
                this.collection.add(this.model.get('episodes'));

                this.render();
            }, this), function() {
                App.loader.hide();
            });
        }
        else {
            this.collection.add(this.model.get('episodes'));
        }
    },

    serializeData: function() {
        return _.extend(this.model.toJSON(), { show: this.show.toJSON() });
    },

    additionalEvents: {
        
    },

    onRender: function() {
        // Delete old actionBar if already loaded
        if (this.actionBar != null) {
            this.actionBar.destroy();
            this.actionBar = null;
        }

        // Render ActionBar
        this.actionBar = new ActionBar({
            model: this.model,
            type: "seasons"
        });
        this.$el.find('.picture-block').after(this.actionBar.render().$el);
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);
    }
});