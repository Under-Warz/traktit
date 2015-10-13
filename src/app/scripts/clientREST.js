var _ = require('underscore');
var Conf = require('Conf');

module.exports = {
	constructHeader: function(xhr) {
		var access_token;
		var currentUser = localStorage.getItem('currentUser');
		
		if (currentUser) {
			currentUser = JSON.parse(currentUser);
			access_token = currentUser.access_token;
		}

		xhr.setRequestHeader("trakt-api-key", Conf.traktTV.client_id);
		xhr.setRequestHeader("trakt-api-version", Conf.traktTV.api_version);
		xhr.setRequestHeader("Authorization", "Bearer " + access_token);
	},

	get: function(url, params, success, error) {
		if (Conf.isDebug) {
			var params = _.extend(params, {
				'nocache': Math.random()
			});
		}

		$.ajax({
			url: url,
			method: 'GET',
			data: params,
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: _.bind(function(xhr) {
				this.constructHeader(xhr);
			}, this),
			success: _.bind(function(response) {
				if (success) {
					success(response);
				}
			}, this),
			error: function() {
				if (error) {
					error();
				}
			}
		})
	},

	post: function(url, params, success, error) {
		$.ajax({
			url: url,
			method: 'POST',
			data: JSON.stringify(params),
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: _.bind(function(xhr) {
				this.constructHeader(xhr);
			}, this),
			success: _.bind(function(response) {
				if (success) {
					success(response);
				}
			}, this),
			error: function() {
				if (error) {
					error();
				}
			}
		})
	}
}