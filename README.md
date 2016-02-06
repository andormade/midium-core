# nota-core
This package contains the core functions for the [Nota](https://github.com/hngrhorace/nota) Web MIDI API wrapper.
It can be used to receive and send custom messages to your MIDI compatible hardware.

```javascript
Nota.ready(function() {
	/* You can select a device by it's manufacturer id or it's port id.
	 * See the documentation for details. */
	var device = Nota.select('espruino');

	/* You can send 24 bit messages in byte array format. */
	device.send(0xaabbcc);
	device.send([0xaa, 0xbb, 0xcc]);

	/* You can listen to specific messages or  */
	device.addEventListener(0xa10000, 0xff0000, function(data) {
		console.log('data received', data);
	});
});
```
