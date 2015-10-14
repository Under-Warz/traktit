var Marionnette = require('marionette');

module.exports = Marionnette.CompositeView.extend({
    originalEvents: {
        "click .navigate": "navigate"
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

    onShow: function() {

    },

    onDestroy: function() {
        this.undelegateEvents();
    }
});