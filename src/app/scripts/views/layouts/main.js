require('marionette');

var F7Region = Marionette.Region.extend({
	oldViews: null,
	initialize: function() {
		this.oldViews = [];
	},
    addView: function(view, options) {
    	// If already view attached, append new one for transition
    	if (this.currentView) {
    		// Save old views for delete later only to reset view on region empty
    		/*if ($(this.el).parent().hasClass('view-login')) {
    			this.oldViews.push(this.currentView);
    		}*/

        	view.render();

        	this.currentView = view;

        	this.triggerMethod('show', view, this);
      		Marionette.triggerMethodOn(view, 'show', view, this, true, true);

      		return this;
      	}
      	else {
      		this.show(view);
      	}
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
	},

  	regions: {
	   mainView: {
    		regionClass: F7Region,
    		selector: ".view-main .pages"
    	},
        loginView: {
            regionClass: F7Region,
            selector: ".view-login .pages"
        }
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
    }
});