var Marionette = require('marionette');
var App = require('App');

var F7Region = Marionette.Region.extend({
	oldViews: null,
	initialize: function() {
		this.oldViews = [];
	},
    attachHtml: function(view) {
    	this.$el.append(view.el);
  	}
});

module.exports = Marionette.LayoutView.extend({
	template: require('../../templates/layouts/main.hbs'),
	attributes: function() {
		return {
			id: "mainLayout"
		}
	},

	events: {
		"click .panel-left a": "navigateFromMenu",
		"click .panel-right a": "didSelectFilter"
	},

  	regions: {
	   	mainView: {
    		regionClass: F7Region,
    		selector: ".view-main .pages"
    	},
        loginView: {
            regionClass: F7Region,
            selector: ".view-login .pages"
        },
        moviesView: {
            regionClass: F7Region,
            selector: ".view-movies .pages"
        }
  	},

  	navigateFromMenu: function(e) {
  		// Close menu
  		window.f7.closePanel();

  		this.navigate(e);

  		e.preventDefault();
        return false;
  	},

  	navigate: function(e) {
  		var view = $(e.currentTarget).data('view');

  		// Switch between views
  		if (view) {
  			$('.view.active').removeClass('active');
  			$(view).addClass('active');
  		}

  		if ($(e.currentTarget).attr('href') != "") {
        	window.router.navigate($(e.currentTarget).attr('href'), { trigger: true });
        }

        e.preventDefault();
        return false;
    },

    didSelectFilter: function(e) {
    	// Close menu
    	window.f7.closePanel();
    	
    	App.triggerMethod('selectFilter', e);

    	e.preventDefault();
    	return false;
    }
});