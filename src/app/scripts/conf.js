var _ = require('underscore');
var tokens = require('./tokens');

var conf = {
    dev: {
        isDebug: true,
        traktTV: _.extend(tokens.dev, {
            api_host: "http://api.staging.trakt.tv",
            api_version: 2
        })
    },
    prod: {
        isDebug: false,
        traktTV: _.extend(tokens.prod, {
            api_host: "https://api-v2launch.trakt.tv",
            api_version: 2
        })
    }
};

// This is Common conf
var common = {
    appname: "TraktIt",
    gcm: {
        senderID: ""
    },
    pagination: {
        limit: 10
    },
    omdb: {
        api_host: "http://www.omdbapi.com"
    }
};

var mergeConf = function() {
    var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    var config;

    if (!app) {
        config = conf.dev;
    }
    else {
        config = conf.prod;
    }

    // Merge common config with env config
    config = $.extend({}, config, common);

    return config;
};

module.exports = mergeConf();