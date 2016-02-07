# midium-core
This package contains the core functions for the [Midium](https://github.com/hngrhorace/midium) Web MIDI API wrapper.
It can be used to receive and send custom messages to your MIDI compatible hardware.

```javascript
Midium.ready(function() {
	/* You can select a device by it's manufacturer id or it's port id.
	 * See the documentation for details. */
	var device = Midium.select('espruino');

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
Once the MIDI API is done with setting up things, it will call the passed function. The select method of Midium is not working until the MIDI API finished loading.

```javascript
Midium.ready(function() {
	/* Only after the MIDI API was ready, can you call the select method. */
	Midium.select('');
});
```

#### Midium.select(selector)
Returns a collection of matched MIDI ports.
You can select them by specifying
- the manufacturer id of the MIDI device.
- the name of the MIDI device.
- the port id.
- an array of port ids.
- a regular expression, which will match the name and the manufacturer.

```javascript
Midium.select('m-audio');
Midium.select('keystation');
Midium.select(12345);
Midium.select([12345, 6789]);
```

#### Midium.prototype.send(message);
You can send a message to the selected ports by passing it to this function.
You can pass it as an integer or as a byte array.
Web MIDI API is working with byte arrays, so for the best performance it is recommended to use them instead of integers.

```javascript
Midium.ready(function() {
	var devices = Midium.select('');
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
var devices = Midium.select('');
/* Checks the most significant byte, calls back if it's 0xa0. */
var reference = device.addEventListener(0xa00000, 0xff00000, function() {});
```

It is recommended to remove unused event listeners to keep the performance of Midium on maximum. See the documentation of removeEventListener.

#### Midium.prototype.removeEventListener(reference)
Removes the specified event listener.

```javascript
var devices = Midium.select('');
var reference = device.addEventListener(0xffffff, 0xffffff, function() {});
device.removeEventListener(reference);
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
