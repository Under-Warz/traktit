var Marionette = require('marionette');
var App = require('App');
var moment = require('moment');
var Conf = require('Conf');

module.exports = Marionette.ItemView.extend({
    template: require('../../templates/partials/single_actionbar.hbs'),
    className: 'action-block content-block',
    type: null,

    initialize: function(options) {
    	this.type = options.type;
    },

    events: {
    	"click .btn-toggle": "toggleAction",
    	"click .show-comments": "showComments",
        "click .btn-rate": "showRatePicker",
        "click .btn-share": "shareIt"
    },

    onDestroy: function() {
        this.undelegateEvents();
    },

    /**
     * Toggle action (history, collection, watchlist)
     */
    toggleAction: function(e) {
        var action = $(e.currentTarget).data('action');

        // Uncheck
        App.loader.show();
        if ($(e.currentTarget).hasClass('remove')) {
            this.model.removeFrom(action, function() {
                App.loader.hide();

                $(e.currentTarget).removeClass('remove');
            }, function() {
                App.loader.hide();
            });
        }
        // Check
        else {
            this.model.addTo(action, function() {
                App.loader.hide();

                $(e.currentTarget).addClass('remove');
            }, function() {
                App.loader.hide();
            });
        }

        e.preventDefault();
        return false;
    },

    /**
     * Show comments
     */
    showComments: function(e) {
    	var url = this.type + '/' + this.model.get('ids').slug + '/comments';

        // Load item's comment if not loaded yet
        if (!this.model.has('comments')) {
            App.loader.show();
            this.model.fetchComments({}, _.bind(function(response) {
                App.loader.hide();
                window.router.navigate(url, { trigger: true });
            }, this), function() {
                App.loader.hide();
                alert('Cannot load comments');
            });
        }
        else {
            window.router.navigate(url, { trigger: true });
        }

        e.preventDefault();
        return false;
    },

    /**
     * Show rating picker
     */
    showRatePicker: function(e) {
        var values = [
            '1 - Weak sauce :(',
            '2 - Terrible',
            '3 - Bad',
            '4 - Poor',
            '5 - Meh',
            '6 - Fair',
            '7 - Good',
            '8 - Great',
            '9 - Superb',
            '10 - Totally ninja!'
        ];

        var picker = window.f7.picker({
            rotateEffect: true,
            toolbarTemplate: require('../../templates/partials/rate_toolbar.hbs')(),
            cols: [
                {
                    textAlign: 'center',
                    values: values
                }
            ],
            onOpen: _.bind(function(picker) {
                picker.container.find('.done').click(_.bind(function() {
                    var value = _.indexOf(values, picker.value[0]);
                    this.saveRating(picker, value);
                }, this));
            }, this)
        });

        picker.open();

        e.preventDefault();
        return false;
    },

    saveRating: function(picker, value) {
    	var obj = {
            rated_at: moment().utc().toISOString(),
            rating: value,
            ids: this.model.get('ids')
		};

		var params;
		if (this.type == 'movies') {
			params = { movies: [obj] };
		}
		else if (this.type == 'shows') {
			params = { shows: [obj] };	
		}

        App.loader.show();
        App.currentUser.postRating(params, _.bind(function(response) {
            App.loader.hide();

            // Close picker
            picker.close();
            
        }, this), function() {
            App.loader.hide();
        });
    },

    /**
     * Share the item
     */
    shareIt: function(e) {
        if (window.cordova) {
            window.plugins.socialsharing.share(this.model.get('title') + '-' + this.model.get('year'), Conf.appname, null, "http://www.trakt.tv/" + this.type + "/" + this.model.get('ids').slug);
        }

        e.preventDefault();
        return false;
    }
});