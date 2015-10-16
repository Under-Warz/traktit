var ChildItemView = require('../childItemView');
var App = require('App');
var Conf = require('Conf');
var ActionBar = require('../partials/single_actionbar');

module.exports = ChildItemView.extend({
    template: require('../../templates/shows/single.hbs'),
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
        // Load movie if no data loaded previously or in storage
        if (this.model.get('fetched') == false) {
            App.loader.show();
            this.model.fetch(_.bind(function() {
                App.loader.hide();
                this.render();
            }, this), function() {
                App.loader.hide();
            });
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
        ChildItemView.prototype.onShow.call(this, this, null);
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