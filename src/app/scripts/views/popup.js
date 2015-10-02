var Marionnette = require('marionette');

module.exports = Marionnette.ItemView.extend({        
    originalEvents: {
        "click .close": "close",
        "click .finish": "finish"
    },

    additionalEvents: {
    },

    events : function() {
        return _.extend({},this.originalEvents,this.additionalEvents);
    },

    initialize: function() {
        this.render();
    },

    onRender: function() {
        window.f7.popup(this.template());
        this.setElement(this.template); // Reload events

        $('#' + this.id).on('closed', _.bind(this.onClosed, this));
    },

    onClosed: function() {
        this.destroy();
    },

    onDestroy: function() {
        this.undelegateEvents();
    },

    close: function(e) {
        this.closePopup();

        e.preventDefault();
        return false;
    },

    finish: function(e) {
        this.closePopup();
        
        e.preventDefault();
        return false;
    },

    closePopup: function() {
        window.f7.closeModal('#' + this.id);
    }
});