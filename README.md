# midium-core
This package contains the core functions for the [Midium](https://github.com/midijs/midium) Web MIDI API wrapper.
It can be used to receive and send custom messages to your MIDI compatible hardware.

```javascript
Midium.ready(function() {
	/* You can select a device by it's manufacturer id or it's port id.
	 * See the documentation for details. */
	var device = new Midium('ploytec pl2');

	/* You can send 24 bit messages in integer or in byte array format. */
	device.send(0xaabbcc);
	device.send([0xaa, 0xbb, 0xcc]);

	/* You can listen to specific messages, or every message by setting the mask
	 * to zero. See the documentation for details. */
	device.addEventListener(0xa10000, 0xff0000, function(data) {
		console.log('data received', data);
	});
});
```
## Documentation
### Function reference
#### Midium.ready(callback)
Once the MIDI API is done with setting up things, it will call the passed function. Midium is not working until the Web MIDI API finished loading.

```javascript
Midium.ready(function() {
	new Midium('');
});
```

#### new Midium(query)
Returns with a Midium instance, which is basically a collection of MIDI ports.
See the documentation of Midium.portQuery.

```javascript
Midium.ready(function() {
	/* Selects all the available ports. */
	var all = new Midium('');
	/* Selects all the ports of devices which were manufactured by m-audio. */
	var maudio = new Midium('m-audio');
	/* Selects all the ports of devices which were named as keystation. */
	var keystation = new Midium('keystation');
	/* Selects the port 12345 */
	var port = new Midium(12345);
	/* Selects ports 12345 and 6789 */
	var ports = new Midium([12345, 6789]);
});
```

#### Midium.portQuery(query)
Returns an array of MIDI ports.
You can select them by specifying
- the manufacturer id of the MIDI device.
- the name of the MIDI device.
- the port id.
- an array of port ids.

```javascript
/* Returns with all of the available ports. */
Midium.portQuery('');
/* Lists all the ports of devices which were manufactured by m-audio. */
Midium.portQuery('m-audio');
/* Lists all the ports of devices which were named as keystation. */
Midium.portQuery('keystation');
/* Returns with the port 12345 */
Midium.portQuery(12345);
/* Returns with ports 12345 and 6789 */
Midium.portQuery([12345, 6789]);
```

#### Midium.prototype.send(message);
You can send a message to the selected ports by passing it to this function.
You can pass it as an integer or as a byte array.
Web MIDI API is working with byte arrays, so for the best performance it is recommended to use them instead of integers.

```javascript
Midium.ready(function() {
	var devices = new Midium('');
	/* You can send it as an integer. */
	device.send(0xffffff);
	/* or as a byte array. */
	device.send([0xff, 0xff, 0xff]);
});
```

#### Midium.prototype.addEventListener(message, mask, callback)
Registers an event listener. The event listener matches the message argument with the received MIDI messages.
With the mask you can set exactly which bits you want to match.
For example you can match only the most significant nibble with the 0xf00000 mask, or the last significant bit with 0x000001.
0xf00000 is useful when you want to listen to a specific MIDI event (like note on) on every channel.

```javascript
var devices = new Midium('');
/* Checks the most significant byte, calls back if it's 0xa0. */
var reference = devices.addEventListener(0xa00000, 0xff00000, function() {});
```

It is recommended to remove unused event listeners to keep the performance of Midium on maximum. See the documentation of removeEventListener.

#### Midium.prototype.removeEventListener(reference)
Removes the specified event listener.

```javascript
var devices = new Midium('');
var reference = devices.addEventListener(0xffffff, 0xffffff, function() {});
devices.removeEventListener(reference);
```

It is recommended to remove unused event listeners to keep the performance of Midium on maximum.

### Utility functions
#### Midium.byteArrayToInt(byteArray)
Converts the given byte array to a 24 bit integer.

```javascript
/* It returns 0xaabbcc */
Midium.byteArrayToInt([0xaa, 0xbb, 0xcc]);
```
#### Midium.intToByteArray(int)
Converts the given 24 bit integer to a byte array.

```javascript
/* It returns [0xaa, 0xbb, 0xcc] */
Midium.intToByteArray(0xaabbcc);
```
