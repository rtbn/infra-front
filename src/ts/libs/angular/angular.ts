require('angular');
/** 
 * Note JCBE 2021-04-15 
 * Commented 2 lines below => the libs are loaded by a script tag in <head>
 * They do not export any global variable.
 * 
require('angular-route');
require('angular-sanitize');
*/

export var angular = (window as any).angular;
if(!(window as any).entcore){
    (window as any).entcore = {};
}
(window as any).entcore.angular = angular;
