var conf = {
    dev: {
        traktTV: {
            client_id: "",
            client_secret: "",
            redirect_uri: "http://localhost:9000",
            api_host: "http://api.staging.trakt.tv",
            api_version: 2
        },
    },
    prod: {
        traktTV: {
            client_id: "",
            client_secret: "",
            redirect_uri: "",
            api_host: "https://api-v2launch.trakt.tv",
            api_version: 2
        },
    }
};

// This is Common conf
var common = {
    gcm: {
        senderID: ""
    },
    pagination: {
        limit: 10
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