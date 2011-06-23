compress = require('compress-buffer').compress;
dgram = require('dgram');

GLOBAL.LOG_EMERG=0;    // system is unusable
GLOBAL.LOG_ALERT=1;    // action must be taken immediately
GLOBAL.LOG_CRIT=2;     // critical conditions
GLOBAL.LOG_ERR=3;      // error conditions
GLOBAL.LOG_ERROR=3;    // because people WILL typo
GLOBAL.LOG_WARNING=4;  // warning conditions
GLOBAL.LOG_NOTICE=5;   // normal, but significant, condition
GLOBAL.LOG_INFO=6;     // informational message
GLOBAL.LOG_DEBUG=7;    // debug-level message

GLOBAL.graylogHost = 'localhost';
GLOBAL.graylogPort = 12201;
GLOBAL.graylogHostname = require('os').hostname();
GLOBAL.graylogToConsole = false;
GLOBAL.graylogFacility = 'Node.js';
GLOBAL.graylogSequence = 0;


function _logToConsole(shortMessage, opts) {
	var consoleString = shortMessage;

	if (opts.full_message) {
		consoleString+="("+opts.full_message+")\n";
	}

	var additionalFields = [];
	Object.keys(opts).forEach(function(key) {
		if (key[0]=='_' && key!="_logSequence") {
			additionalFields.push(
				"  " +
				key.substr(1,1024) +
				": " +
				'\033[' + 34 + 'm' + 
				opts[key] +
				'\033[' + 39 + 'm'
			);
		}
	});

	if (additionalFields.length>0) {
		consoleString+="\n"+additionalFields.join("\n");
	}

	console.log(consoleString);
}

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
	opts.facility = opts.facility || GLOBAL.graylogFacility;

	if (GLOBAL.graylogSequence) {
		opts['_logSequence'] = GLOBAL.graylogSequence++;
	}

	opts.short_message = shortMessage;
	
	if (GLOBAL.graylogToConsole) { 
		_logToConsole(shortMessage, opts);
	}

	var message = compress(JSON.stringify(opts));
	if (message.length>8192) { // FIXME: support chunked
		sys.debug("Graylog oops: log message size > 8192, I print to stderr and give up: \n"+logString);
		return;
	}

	try { 
		var graylog2Client = dgram.createSocket("udp4");
		graylog2Client.send(message, 0, message.length, GLOBAL.graylogPort, GLOBAL.graylogHost);
		graylog2Client.close();
	} catch(e) { 
	}
}

GLOBAL.log = log;
