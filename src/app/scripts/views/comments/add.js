var PopupView = require('../popup');

module.exports = PopupView.extend({
    id: 'popup-add-comment',
    template: require('../../templates/comments/add.hbs')
});