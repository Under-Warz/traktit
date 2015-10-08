var $ = require('jquery');
var Backbone = require('backbone');
var Framework7 = require('framework7');
var HandlebarsHelpers = require('./hbs_helpers');

var App = require('App');
var Conf = require('Conf');
var Router = require('./routes.js');

// Init app
App.on('start', function() {
    // Cross domain
    $.support.cors = true;
    
    // Attach router
    window.router = new Router();

    // Force first hashtag to prevent bug on # links
    if (window.location.href.indexOf('#') == -1) {
        window.location.href = "#";
    }

    // Init Framework7
    var f7 = new Framework7({
        router: true,
        pushState: false,
        fastClicks: true,
        scrollTopOnStatusbarClick: true
    });
    window.f7 = f7; // global framework7 instance

    /**
     * Register views (similar as NavigationController in iOS)
     */
    // Main view
    f7.addView('.view-main', {
        dynamicNavbar: true,
        domCache: true // Use to get deep back button work
    });

    // Login view
    f7.addView('.view-login', {
        domCache: true // Use to get deep back button work
    });

    // Movies view
    f7.addView('.view-movies', {
        domCache: true, // Use to get deep back button work
        dynamicNavbar: true
    });

    // Attache current Marionette view to Framework7 page for delete
    f7.onPageInit('*', function(page) {
        var viewSelector = page.view.selector;

        // Save BM's view for destroy later
        switch(viewSelector) {
            case '.view-main':
                page.context = window.router.layout.mainView.currentView;
                break;

            case '.view-login':
                page.context = window.router.layout.loginView.currentView;
                break;

            case '.view-movies':
                page.context = window.router.layout.moviesView.currentView;
                break;
        }
    });

    /**
     * Destroy Marionette view after back
     */
    f7.onPageAfterBack('*', function(page) {
        page.context.destroy(); // On back, destroy the BM's view attach to the F7's Page
    });

    // Start Backbone history (not really used due to Framework7 router)
    if (Backbone.history){
        Backbone.history.start();
    }
});

// Start app
App.start();


/**
 * Cordova init
 */
if (window.cordova) {
    document.addEventListener('deviceready', function () {
        // On resume app
        document.addEventListener("resume", onResume, false);

        // On pause app
        document.addEventListener("pause", onPause, false);

        // Android : back / app closed
        document.addEventListener("backbutton", function() {
            // Close popup
            if ($('#popup-home').length > 0) {
                window.f7.closeModal('#popup-home');
            }
            // Manage back popup login
            else if ($('#popup-login').hasClass('modal-in')) {
                if ($('.view-login .pages .page').length > 1) {
                    $('.view-login')[0].f7View.back();
                }
                else {
                    window.f7.closeModal('#popup-login');
                }
            }
            // Close app if on first page of views (home index, tab2 index...)
            else if (
                ($('.view.active').hasClass('view-main') && ($('.view-main .pages .page').length == 1 || $('#home').hasClass('page-on-center'))) ||
                ($('.view.active').hasClass('view-tab2') && ($('.view-tab2 .pages .page').length == 1 || $('#tab2').hasClass('page-on-center')))
            ) {
                exitApp();
            }
            // Back for all other views
            else {
                $('.view.active')[0].f7View.back();
            }
        }, false);
    });
}

// Exit app
function exitApp() {
    if (device.platform == 'Android') {
        navigator.app.exitApp();
    }
}

// On resume
function onResume() {
    
}

// On pause
function onPause() {
    
}