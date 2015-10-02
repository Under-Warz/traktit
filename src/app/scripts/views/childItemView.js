var Marionnette = require('marionette');

module.exports = Marionnette.ItemView.extend({
    activeView: '.view.active', // Default to current active view, this is need to be set for popup's navigation
    originalEvents: {
        "click .navigate": "navigate",
        "click .back": "back"
    },

    additionalEvents: {
    },

    initialize: function(options) {
        if (options.activeView) {
            this.activeView = options.activeView;
        }
    },

    events : function() {
        return _.extend({},this.originalEvents,this.additionalEvents);
    },

    navigate: function(e) {
        window.router.navigate($(e.currentTarget).attr('href'), { trigger: true });

        e.preventDefault();
        return false;
    },

    back: function(e) {     
        $(this.activeView)[0].f7View.router.back();

        e.preventDefault();
        return false;
    },

    onDestroy: function() {
        this.undelegateEvents();
    },

    onShow: function(view, region, load, f7view) {
        if (load) {
            $(this.activeView)[0].f7View.router.load({
                content: this.el,
                animatePages: true
            });

            this.setElement(this.template); // Reload events
        }
    }
});