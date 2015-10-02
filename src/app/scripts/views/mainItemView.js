var Marionnette = require('marionette');

module.exports = Marionnette.ItemView.extend({
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

    onDestroy: function() {
        this.undelegateEvents();
    }
});