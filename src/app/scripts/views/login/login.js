var $ = require('jquery');
var _ = require('underscore');
var MainItemView = require('../mainItemView');
var User = require('../../models/user');
var App = require('App');
var Conf = require('Conf');

module.exports = MainItemView.extend({
    template: require('../../templates/login/login.hbs'),
    connect: null,

    attributes: function() {
        return {
            'id': 'login',
            'class': 'page',
            'data-page': 'login'
        }
    },

    additionalEvents: {
        "click .btn-connect": "traktvConnect"
    },

    initialize: function() {
        $('.view.active').removeClass('active');
        $('.view-login').addClass('active');    
    },

    traktvConnect: function(e) {
        if (window.cordova) {
            var params = {
                response_type: "code",
                client_id: Conf.traktTV.client_id,
                redirect_uri: Conf.traktTV.redirect_uri
            };

            // Open Twitter authorize
            this.connect = window.open(Conf.traktTV.api_host + '/oauth/authorize?' + $.param(params), '_blank', 'location=no,hardwareback=yes,allowInlineMediaPlayback=yes,mediaPlaybackRequiresUserAction=no');
            this.connect.addEventListener('loadstart', _.bind(this.connectCallback, this));
        }
        else {
            var fakeResponse = {
                access_token: "",
                created_at: "",
                expires_in: "",
                refresh_token: "",
                scope: "public",
                token_type: "bearer"
            };

            this.didConnect(fakeResponse);
        }
    },

    connectCallback: function(event) {
        // Check if we've got code in GET callback
        if (event.url.indexOf("http://localhost:9000/?") >= 0) {
            var params = event.url.substr(event.url.indexOf('?') + 1),
                code;

            // Parse params to get code
            params = params.split('&');
            _.each(params, function(param) {
                var y = param.split('=');
                if(y[0] === 'code') {
                    code = y[1];
                }
            });

            // Get access token
            if (code) {
                var params = {
                    code: code,
                    client_id: Conf.traktTV.client_id,
                    client_secret: Conf.traktTV.client_secret,
                    redirect_uri: Conf.traktTV.redirect_uri,
                    grant_type: "authorization_code"
                };

                $.post(Conf.traktTV.api_host + '/oauth/token', params)
                    .done(_.bind(function(response) {
                        // Close connect
                        this.connect.close();

                        this.didConnect(response);
                    }, this))
                    .fail(_.bind(function() {
                        this.connect.close();

                        alert('Oops! Cannot connect to TraktTV');
                    }, this));
            }
        }
    },

    didConnect: function(response) {
        // Create user
        App.currentUser = new User(response);

        // Navigate to home
        window.router.navigate('', { trigger: true });
    }
});