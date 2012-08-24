var zlib = require('zlib'),
    dgram = require('dgram'),
    util = require('util');

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
		consoleString+=" ("+opts.full_message+")\n";
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

	util.log(consoleString);
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
	opts.level = opts.level || GLOBAL.LOG_INFO;
	opts.facility = opts.facility || GLOBAL.graylogFacility;

	if(!opts.file){
		retrieveFileInfo(opts);
	}

	if (GLOBAL.graylogSequence) {
		opts['_logSequence'] = GLOBAL.graylogSequence++;
	}

	opts.short_message = shortMessage;
	
	if (GLOBAL.graylogToConsole) { 
		_logToConsole(shortMessage, opts);
	}

	var message = new Buffer(JSON.stringify(opts));
	zlib.deflate(message, function (err, compressedMessage) {
		if (err) {
			return;
		}

		if (compressedMessage.length>8192) { // FIXME: support chunked
			util.debug("Graylog oops: log message size > 8192, I print to stderr and give up: \n" + message.toString());
			return;
		}

		var graylog2Client = dgram.createSocket("udp4");
		graylog2Client.send(compressedMessage, 0, compressedMessage.length, GLOBAL.graylogPort, GLOBAL.graylogHost, function (err, byteCount) {
			graylog2Client.close();
		});
	});
}

/**
 * Retrieves the filename and line number where log() was called
 *
 * @param {Object} opts The options object that will be altered with 'file' and 'line' properties
 */
function retrieveFileInfo(opts){
	var err = new Error("test"),
		stack = (err.stack || "").toString().split(/\r?\n/),
		match;

	for(var i=0, len = stack.length; i<len; i++){
		if((match = stack[i].match(/^\s*at\s[^\(]+\(([^\):]+):(\d+):\d+\)/))){
			if(__filename.substr(-match[1].length) == match[1]){
				continue;
			}
			opts.file = match[1];
			opts.line = Number(match[2]) || 0;
			break;
		}
	}

}

GLOBAL.log = log;

