/*
 *  pareUserAgent: A pretty simple parser for modern user-agent strings
 * 
 * Copyright (c) 2017-2018 Levyco Developmemt, LLC
 * bret@levycodev.com
 * 
 * Feel free to use this software for whatever you want.  Common courtesy is to 
 * leave the above copyright notice in all implementations.
 * 
 */

function parseUserAgent() {

    var ua = navigator.userAgent;
    var len = ua.length;
    var state = 'KVP';
    var ptr = 0;
    var raw;
    var tmp
    var keys = {}
    var keylist = [];
    var platform = [];
    var engine = [];

    while (state != 'DONE') {
        while ((ptr < len) && (ua.charCodeAt(ptr) == 32)) ++ptr;
        if (ptr < len) {
            switch (state) {
                case 'KVP':
                    if (ua.charAt(ptr) == '(') {
                        state = 'COMMENT';
                        ++ptr;
                    }
                    else {
                        raw = '';
                        while ((ptr < len) && (ua.charCodeAt(ptr) != 32)) {
                            raw += ua.charAt(ptr)
                            ++ptr;
                        }
                        tmp = raw.split('/');
                        keys[tmp[0].toLowerCase()] = tmp[1];
                        keylist = keylist.concat([tmp[0].toLowerCase()]);
                    }
                break;
                case 'COMMENT':
                    raw = '';
                    while ((ptr < len) && (ua.charAt(ptr) != ')')) {
                        raw += ua.charAt(ptr)
                        ++ptr;
                    }
                    ptr += (ptr < len && ua.charAt(ptr) == ')' ? 1 : 0);
                    if (raw.indexOf(',') >= 0) {
                        engine = engine.concat (raw.split(','));
                    }
                    else {
                        platform = platform.concat (raw.split(';'));
                    }
                    state = 'KVP';
                break;
            }
        }
        else {
            state = 'DONE';
        }
    }
    for (var k in platform) {
        platform[k] = platform[k].trim();
    }
    for (var k in engine) {
        engine[k] = engine[k].trim();
    }
    
    var analysis = { "identified":false, 'browser':'', 'version':'', 'userAgent':ua };
    if (keylist.length > 0) {
        if (keys['opera']) {
            analysis.browser = "Safari";
            analysis.version = keys['version'];
            analysis.identified = true;
        }
        else if ((keylist[keylist.length-1] == "safari") && keys['version']) {
            analysis.browser = "Safari";
            analysis.version = keys['version'];
            analysis.identified = true;
        }
        else if ((keylist[keylist.length-1] == "safari") && keys['chrome']) {
            analysis.browser = "Chrome";
            analysis.version = keys['chrome'];
            analysis.identified = true;
        }
        else if ((keys['chrome'] === undefined) && (keys['safari'] === undefined) && (keys['firefox'] === undefined) && (keys['edge'] === undefined)) {
            analysis.browser = "IE";
            analysis.version = '0';
            for (var k in platform) {
                if (platform[k].substr(0,3) == 'rv:') analysis.version = platform[k].substr(3);
            }
            analysis.identified = true;
        }
        else {
            analysis.browser = keylist[keylist.length-1];
            analysis.version = keys[keylist[keylist.length-1]];
            analysis.identified = true;
        }
    }

    return (analysis);

}