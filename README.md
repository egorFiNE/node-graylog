# node-graylog

Graylog2 client library for Node.js

## Synopsis

```javascript
	require("graylog");
```
	
Short message:

```javascript
	log("What we've got here is...failure to communicate");
```

Long message:

```javascript
	log("What we've got here is...failure to communicate", "Some men you just 
		can't reach. So you get what we had here last week, which is the way he wants 
		it... well, he gets it. I don't like it any more than you men.");
```

Short with options:

```javascript
	log("What we've got here is...failure to communicate", { level: LOG_DEBUG });
```

Long with options: 

```javascript
	log("What we've got here is...failure to communicate", "Some men you just 
		can't reach. So you get what we had here last week, which is the way he wants 
		it... well, he gets it. I don't like it any more than you men.", 
		{
			facility: "Steve Martin"
		}
	);
```

You can add custom fields to the options: 
	
```javascript
	log("What we've got here", { 
		level: LOG_DEBUG,
		_failure: "to communicate"
	});
```

## Options

* <code>facility</code> - by default it's set to <code>GLOBAL.graylogFacility</code>.
* <code>level</code> - syslog levels, one of: <code>LOG_EMERG</code>, <code>LOG_ALERT</code>, <code>LOG_CRIT</code>, <code>LOG_ERR</code>, <code>LOG_WARNING</code>, <code>LOG_NOTICE</code>, <code>LOG_INFO</code> (default), <code>LOG_DEBUG</code>.
* <code>timestamp</code> - unixtime of log event, by default it's now
* <code>host</code> - by default, it's auto detected

## Additional settings

You can set <code>GLOBAL.graylogHost</code> and <code>GLOBAL.graylogPort</code> to the host and port of the Graylog2 server. By defaults it's <code>localhost</code> and <code>12201</code>.

You can set <code>GLOBAL.graylogToConsole</code> to <code>true</code> to log JSON entries to console as well (useful for development in case you don't want to have graylog2 running on your workstation).

You should set <code>GLOBAL.graylogFacility</code> to the name of your application. By default it's set to "Node.js". 

## Modification of the GLOBAL object?! But why?

I know, it's wrong. However I like it that way and I truly believe that logger function must be the easiest to call for the programmer to never hesitate using it. So I think that logger functions should be one of the extremely few cases where global namespace pollution is feasible. 

## What is graylog2 after all? 

It's a miracle. Get it at http://www.graylog2.org/

## Installation

	npm install .

## TODO

* Limit messages size to MTU size?..


## License

See LICENSE file. Basically, it's a kind of "do-whatever-you-want-for-free" license.

## Author

Egor Egorov <me@egorfine.com>

