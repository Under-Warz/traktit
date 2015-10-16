var ChildCompositeView = require('../childCompositeView');
var App = require('App');
var Conf = require('Conf');
var ActionBar = require('../partials/single_actionbar');
var SeasonView = require('../list/season');
var SeasonCollection = require('../../collections/seasons');

module.exports = ChildCompositeView.extend({
    template: require('../../templates/shows/single.hbs'),
    childView: SeasonView,
    childViewContainer: ".seasons ul",
    castSwiper: null,
    relatedSwiper: null,
    actionBar: null,

    attributes: function() {
        return {
            id: "shows-single",
            class: "page single",
            "data-page": "shows-single"
        }
    },

    initialize: function() {
        // Construct season collection
        this.collection = new SeasonCollection;

        // Load movie if no data loaded previously or in storage
        if (this.model.get('fetched') == false) {
            App.loader.show();
            this.model.fetch(_.bind(function() {
                App.loader.hide();

                // Construct season collection
                console.log(this.model);
                this.collection.add(this.model.get('seasons'));

                this.render();
            }, this), function() {
                App.loader.hide();
            });
        }
        else {
            console.log(this.model);
            this.collection.add(this.model.get('seasons'));
        }
    },

    additionalEvents: {
        "click .related .swiper-slide": "showRelatedShow"
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
            type: "shows"
        });
        this.$el.find('.picture-block').after(this.actionBar.render().$el);

        setTimeout(_.bind(function() {
            // Render casting
            if (this.model.get('cast')) {
                this.castSwiper = window.f7.swiper(this.$el.find('.cast'), {
                    slidesPerView: 'auto',
                    preventClicks: true
                });
            }

            // Render related
            if (this.model.get('related')) {
                this.relatedSwiper = window.f7.swiper(this.$el.find('.related'), {
                    slidesPerView: 'auto',
                    preventClicks: true
                });
            }
        }, this), 500);
    },

    onShow: function() {
        ChildCompositeView.prototype.onShow.call(this, this, null);
    },

    /**
     * Show related show
     */
    showRelatedShow: function(e) {
        var index = this.$el.find('.related .swiper-slide').index(e.currentTarget);
        var relatedShow = this.model.get('related')[index];

        if (App.shows[relatedShow.ids.slug] == null) {
            App.shows[relatedShow.ids.slug] = relatedShow;
        }

        window.router.navigate('shows/' + relatedShow.ids.slug, { trigger: true });

        e.preventDefault();
        return false;
    }
});