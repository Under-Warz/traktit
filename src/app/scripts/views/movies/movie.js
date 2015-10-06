var Marionette = require('marionette');
var App = require('App');

module.exports = Marionette.ItemView.extend({
    template: require('../../templates/movies/movie.hbs'),
    tagName: 'li',
    className: 'swipeout',

    events: {
    	"click .swipeout-content": "showMovie"
    },

    showMovie: function(e) {
    	if (App.movies[this.model.get('ids').slug] == null) {
    		App.movies[this.model.get('ids').slug] = this.model.toJSON();
    	}

    	window.router.navigate('movies/' + this.model.get('ids').slug, { trigger: true });

    	e.preventDefault();
    	return false;
    }
});