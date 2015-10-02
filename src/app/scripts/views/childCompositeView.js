var Marionnette = require('marionette');

module.exports = Marionnette.CompositeView.extend({
    originalEvents: {
        "click .navigate": "navigate",
        "click .back": "back"
    },

    additionalEvents: {
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
        $('.view.active')[0].f7View.router.back();

        e.preventDefault();
        return false;
    },

    onDestroy: function() {
        this.undelegateEvents();
    },

    onShow: function(view, region, load) {
        if (load) {
            $('.view.active')[0].f7View.router.load({
                content: this.el,
                animatePages: App.animatePages
            });

            this.setElement(this.template); // Reload events
        }
    }
});