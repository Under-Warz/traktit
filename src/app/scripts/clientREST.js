var Conf = require('Conf');
var App = require('App');

module.exports = {
	get: function(url, params, success, error) {
		$.ajax({
			url: url,
			data: params,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("trakt-api-key", Conf.traktTV.client_id);
				xhr.setRequestHeader("trakt-api-version", Conf.traktTV.api_version);
				xhr.setRequestHeader("Authorization", "Bearer " + App.currentUser.get('access_token'));
			},
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