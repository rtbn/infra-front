export var moment = require('moment');
if (!window.entcore) {
    window.entcore = {};
}
window.entcore.moment = moment.moment;
(window as any).moment = moment;