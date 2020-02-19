require('core-js');
var _ = require('underscore');
(window as any)._ = _;

declare let moment: any;

if(!window.entcore){
	window.entcore = {};
}

if((window as any).appPrefix === undefined){
    if(!window.entcore){
        window.entcore = {};
    }
	if(window.location.pathname.split('/').length > 0){
		(window as any).appPrefix = window.location.pathname.split('/')[1];
        window.entcore.appPrefix = (window as any).appPrefix;
	}
}

var xsrfCookie;
if(document.cookie){
    var cookies = _.map(document.cookie.split(';'), function(c){
        return {
            name: c.split('=')[0].trim(), 
            val: c.split('=')[1].trim()
        };
    });
    xsrfCookie = _.findWhere(cookies, { name: 'XSRF-TOKEN' });
}

export var appPrefix: string = (window as any).appPrefix;

if((window as any).infraPrefix === undefined){
	(window as any).infraPrefix = 'infra';
}

export let infraPrefix: string = (window as any).infraPrefix;
export let currentLanguage = '';
export type BrowserInfo = {
    name:'MSIE'|'Chrome'|'Safari'|'Firefox',
    version:number,
}
export const devices = {
    isIE: () => navigator.userAgent.indexOf('Trident') !== -1,
    isiOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    isIphone: () => navigator.userAgent.indexOf("iPhone") != -1,
    isIpod: () => navigator.userAgent.indexOf("iPod") != -1 ,
    isIpad: () =>navigator.userAgent.indexOf("iPad") != -1 ,
    getBrowserInfo ():BrowserInfo{
        const safeSplit = (str: string = "", pattern: string = "") => {
            if (typeof str == "string") {
                return str.split(pattern);
            } else {
                return [];
            }
        }
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Chrome') !== -1) {
			const chromeVersion = safeSplit(userAgent, 'Chrome/')[1];
			const version = parseInt(safeSplit(chromeVersion, '.')[0]);
			return {
				name: 'Chrome',
				version: version,
			}
		}
		else if (userAgent.indexOf('IEMobile') !== -1) {
			const ieVersion = safeSplit(userAgent, 'IEMobile/')[1];
			const version = parseInt(safeSplit(ieVersion, ';')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
		}
		else if (userAgent.indexOf('AppleWebKit') !== -1 && userAgent.indexOf('Chrome') === -1) {
			const safariVersion = safeSplit(userAgent, 'Version/')[1];
			const version = parseInt(safeSplit(safariVersion, '.')[0]);
			return {
				name: 'Safari',
				version: version,
			}
		}
		else if (userAgent.indexOf('Firefox') !== -1) {
			const ffVersion = safeSplit(userAgent, 'Firefox/')[1];
			const version = parseInt(safeSplit(ffVersion, '.')[0]);
			return {
				name: 'Firefox',
				version: version,
			}
		}
		else if (userAgent.indexOf('MSIE') !== -1) {
			const msVersion = safeSplit(userAgent, 'MSIE ')[1];
			const version = parseInt(safeSplit(msVersion, ';')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
		}
		else if (userAgent.indexOf('MSIE') === -1 && userAgent.indexOf('Trident') !== -1) {
			const msVersion = safeSplit(userAgent, 'rv:')[1];
			const version = parseInt(safeSplit(msVersion, '.')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
		}
    }
};

const defaultLanguage = () => {
    const request = new XMLHttpRequest();
    request.open('GET', '/locale');
    if(xsrfCookie){
        request.setRequestHeader('X-XSRF-TOKEN', xsrfCookie.val);
    }
    (request as any).async = false;
    request.onload = function(){
        if(request.status === 200){
            currentLanguage = JSON.parse(request.responseText).locale;
            (window as any).currentLanguage = currentLanguage;
            window.entcore.currentLanguage = currentLanguage;
            if((window as any).moment){
                if (currentLanguage === 'fr') {
                    moment.updateLocale(currentLanguage, {
                        calendar: {
                            lastDay: '[Hier à] HH[h]mm',
                            sameDay: '[Aujourd\'hui à] HH[h]mm',
                            nextDay: '[Demain à] HH[h]mm',
                            lastWeek: 'dddd [dernier à] HH[h]mm',
                            nextWeek: 'dddd [prochain à] HH[h]mm',
                            sameElse: 'dddd LL'
                        }
                    });
                }
                else {
                    moment.lang(currentLanguage);
                }
            }
        }
    };
    request.send(null);
}

(function(){
    if(window.notLoggedIn){
        defaultLanguage();
        return;
    }
    // User preferences language
    var preferencesRequest = new XMLHttpRequest();
	preferencesRequest.open('GET', '/userbook/preference/language');
    if(xsrfCookie){
        preferencesRequest.setRequestHeader('X-XSRF-TOKEN', xsrfCookie.val);
    }
	(preferencesRequest as any).async = false;

	preferencesRequest.onload = function(){
        if(preferencesRequest.status === 200){
            try{
                currentLanguage = JSON.parse(JSON.parse(preferencesRequest.responseText).preference)['default-domain'];
                (window as any).currentLanguage = currentLanguage;
                window.entcore.currentLanguage = currentLanguage;
    		} catch(e) {
    			defaultLanguage();
    		}
        }

        if(!currentLanguage){
            defaultLanguage();
        }
    };
    preferencesRequest.send(null);
}());

if(document.addEventListener){
	document.addEventListener('DOMContentLoaded', function(){
		document.getElementsByTagName('body')[0].style.display = 'none';
	});
}

export let routes:any = {
	define: function(routing){
		this.routing = routing;
	}
};

export let cleanJSON = (obj) => {
    if (!obj) {
        return obj;
    }
    
    if(obj instanceof Array){
        return obj.map((e) => cleanJSON(e));
    }

    let dup = {};
    
    if (obj.toJSON) {
        dup = obj.toJSON();
        return dup;
    }

    if (typeof obj === 'string') {
        return obj;
    }

    for (let prop in obj) {
        if (typeof obj[prop] === 'object' && !(obj[prop] instanceof Array)) {
            dup[prop] = cleanJSON(obj[prop])
        }
        else {
            if (obj[prop] instanceof Array) {
                dup[prop] = [];
                for (let el of obj[prop]) {
                    dup[prop].push(cleanJSON(el));
                }
            }
            else if (obj.hasOwnProperty(prop) && prop !== 'callbacks' && prop !== 'data' && prop !== '$$hashKey') {
                dup[prop] = obj[prop];
            }
        }
    }
    return dup;
}

(window as any).entcore.routes = routes;
(window as any).entcore.cleanJSON = cleanJSON;

if(!Array.prototype.forEach){
	window.location.href = "/auth/upgrade";
}
