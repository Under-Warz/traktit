var Conf = require('Conf');
var App = require('App');

module.exports = {
	constructHeader: function(xhr) {
		xhr.setRequestHeader("trakt-api-key", Conf.traktTV.client_id);
		xhr.setRequestHeader("trakt-api-version", Conf.traktTV.api_version);
		xhr.setRequestHeader("Authorization", "Bearer " + App.currentUser.get('access_token'));
	},

	get: function(url, params, success, error) {
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