var Marionnette = require('marionette');

module.exports = Marionette.CompositeView.extend({
    template: require('../../templates/home/show.hbs'),
    tagName: 'li',
    className: 'swipeout'
});