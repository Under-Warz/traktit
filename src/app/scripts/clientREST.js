var _ = require('underscore');
var Conf = require('Conf');

module.exports = {
	get: function(url, params, success, error) {
		this._request('GET', url, params, null, success, error);
	},

	post: function(url, params, success, error) {
		this._request('POST', url, null, params, success, error);
	},

	delete: function(url, params, success, error) {
		this._request('DELETE', url, null, params, success, error);
	},

	/**
	 * Private methods
	 */
 	_constructHeader: function(api, xhr) {
 		if (api == 'trakttv') {
			var access_token;
			var currentUser = localStorage.getItem('currentUser');
			
			if (currentUser) {
				currentUser = JSON.parse(currentUser);
				access_token = currentUser.access_token;
			}

			xhr.setRequestHeader("trakt-api-key", Conf.traktTV.client_id);
			xhr.setRequestHeader("trakt-api-version", Conf.traktTV.api_version);
			xhr.setRequestHeader("Authorization", "Bearer " + access_token);
		}
	},

	_request: function(method, url, getParams, postParams, success, error) {
		if (Conf.isDebug) {
			var getParams = _.extend(getParams, {
				'nocache': Math.random()
			});
		}

		var api;
		if (url.indexOf(Conf.traktTV.api_host) > -1) {
			api = 'trakttv';
		}

		var params;
		if (method == 'GET') {
			params = getParams;
		}
		else {
			params = JSON.stringify(postParams);
		}

		$.ajax({
			url: url,
			method: method,
			data: params,
			dataType: 'json',
			//contentType: 'application/json',
			beforeSend: _.bind(function(xhr) {
				this._constructHeader(api, xhr);
			}, this),
			success: _.bind(function(response) {
				if (success) {
					success(response);
				}
			}, this),
			error: function(response) {
				if (error) {
					error(response.responseJSON);
				}
			}
		});
	}
}