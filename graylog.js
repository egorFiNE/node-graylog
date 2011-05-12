compress = require('compress-buffer').compress;
dgram = require('dgram');

GLOBAL.LOG_EMERG=0;    // system is unusable
GLOBAL.LOG_ALERT=1;    // action must be taken immediately
GLOBAL.LOG_CRIT=2;     // critical conditions
GLOBAL.LOG_ERR=3;      // error conditions
GLOBAL.LOG_WARNING=4;  // warning conditions
GLOBAL.LOG_NOTICE=5;   // normal, but significant, condition
GLOBAL.LOG_INFO=6;     // informational message
GLOBAL.LOG_DEBUG=7;    // debug-level message

GLOBAL.graylogHost = 'localhost';
GLOBAL.graylogPort = 12201;
GLOBAL.graylogHostname = require('os').hostname();
GLOBAL.graylogToConsole = false;

var graylog2Client  = dgram.createSocket("udp4");

function log(shortMessage, a, b) {
	var opts = {};
	if (typeof a == 'string'){
		opts = b || {};
		opts.full_message=a;
	} else if (typeof a == 'object') {
		opts = a || {};
	}

	opts.version="1.0";
	opts.timestamp = opts.timestamp || new Date().getTime()/1000 >> 0;
	opts.host = opts.host || GLOBAL.graylogHostname;
	opts.level = opts.level || LOG_INFO;
	opts.facility = opts.facility || "Node.js";

	opts.short_message = shortMessage;
	
	var logString = JSON.stringify(opts);
	if (GLOBAL.graylogToConsole) { 
		console.log(logString);
	}

	var message = compress(logString);

	graylog2Client.send(message, 0, message.length, GLOBAL.graylogPort, GLOBAL.graylogHost);
	graylog2Client.close();
}

GLOBAL.log = log;
