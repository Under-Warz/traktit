var ChildItemView = require('../childItemView');
var App = require('App');

module.exports = ChildItemView.extend({
    template: require('../../templates/movies/single.hbs'),
    castSwiper: null,
    relatedSwiper: null,

    initialize: function() {
        // Load movie
        if (this.model.get('fetched') == false) {
            this.model.fetch();
        }

        // Reload
        this.model.on('change', this.bindData, this);
    },

    additionalEvents: {
        "click .btn-check": "toggleCheck"
    },

    bindData: function() {
        _.each(this.$el.find('#movies-single *[data-attr]'), _.bind(function(elm) {
            $(elm).empty().html(this.model.get($(elm).data('attr')));
        }, this));

        // Render actors
        this.renderCast();

        // Render related
        this.renderRelated();

        // Seenit ?
        if (this.model.get('seenit') == true) {
            this.$el.find('#movies-single .btn-check').addClass('uncheck');
        }
    },

    onShow: function() {
        ChildItemView.prototype.onShow.call(this, this, null, true);

        this.bindData();
    },

    renderCast: function() {
        try {
            if (this.model.get('cast').length > 0 && this.castSwiper == null) {
                this.castSwiper = window.f7.swiper(this.$el.find('#movies-single .cast'), {
                    slidesPerView: 'auto'
                });

                _.each(this.model.get('cast'), _.bind(function(item) {
                    this.castSwiper.appendSlide(require('../../templates/partials/actor.hbs')(item));
                }, this)); 
            }
        }
        catch(e) {        
        }
    },

    renderRelated: function() {
        try {
            if (this.model.get('related').length > 0 && this.relatedSwiper == null) {
                this.relatedSwiper = window.f7.swiper(this.$el.find('#movies-single .related'), {
                    slidesPerView: 'auto'
                });

                _.each(this.model.get('related'), _.bind(function(item) {
                    this.relatedSwiper.appendSlide(require('../../templates/partials/movie.hbs')(item));
                }, this)); 
            }
        }
        catch(e) {        
        }
    },

    /**
     * Check / uncheck movie
     */
    toggleCheck: function(e) {
        // Uncheck
        if ($(e.currentTarget).hasClass('uncheck')) {
            this.model.removeFromHistory(function() {
                $(e.currentTarget).removeClass('uncheck');
            });
        }
        // Check
        else {
            this.model.addToHistory(function() {
                $(e.currentTarget).addClass('uncheck');
            });
        }

        e.preventDefault();
        return false;
    }
});