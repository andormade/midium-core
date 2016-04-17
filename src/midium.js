class Midium {
	constructor(query) {
		this.eventListeners = [];
		this.ports = [];

		if (Midium.isReady) {
			this.add(Midium.portQuery(query));
		}
	}

	static ready(callback, errorCallback) {
		navigator.requestMIDIAccess({
			sysex : false
		}).then(
			function(midiAccess) {
				Midium.isReady = true;
				Midium.midiAccess = midiAccess;
				callback(midiAccess);
			},
			function(error) {
				Midium.isReady = false;
				errorCallback(error);
			}
		);
	}

	static portQuery(query) {
		if (!Midium.isReady) {
			return [];
		}

		var ports = [];

		/* If the query is a MIDIInput or output. */
		if (
			query instanceof window.MIDIOutput ||
			query instanceof window.MIDIInput
		) {
			ports[0] = query;
		}

		else if (
			typeof query === 'number' &&
			Midium.midiAccess.inputs.has(query)
		) {
			ports[0] = Midium.midiAccess.inputs.get(query);
		}

		else if (
			typeof query === 'number' &&
			Midium.midiAccess.outputs.has(query)
		) {
			ports[0] = Midium.midiAccess.outputs.get(query);
		}

		else if (Array.isArray(query)) {
			query.forEach(function(item) {
				ports.push(midiPortQuery(item)[0]);
			});
		}

		else if (
			typeof query === 'string' ||
			query instanceof window.RegExp
		) {
			Midium.midiAccess.inputs.forEach(function each(port) {
				let name = port.name + ' ' + port.manufacturer;
				if (new RegExp(query, 'i').test(name)) {
					ports.push(port);
				}
			});

			Midium.midiAccess.outputs.forEach(function each(port) {
				let name = port.name + ' ' + port.manufacturer;
				if (new RegExp(query, 'i').test(name)) {
					ports.push(port);
				}
			});
		}

		return ports;
	}

	static byteArrayToInt(byteArray) {
		if (typeof byteArray === 'number') {
			return byteArray;
		}

		return byteArray[0] * 0x10000 + byteArray[1] * 0x100 + byteArray[2];
	}

	static intToByteArray(int) {
		if (Array.isArray(int)) {
			return int;
		}

		return [int >> 16, (int >> 8) & 0x00ff,	int & 0x0000ff];
	}

	add(ports) {
		Array.prototype.concat(ports).forEach(function(port) {
			port.onstatechange = this._onStateChange.bind(this);
			port.onmidimessage = this._onMIDIMessage.bind(this);
			this.ports.push(port);
		}, this);

		return this;
	}

	removeReferences() {
		this.ports.forEach(function(port) {
			port.onmidimessage = null;
			port.onstatechange = null;
		})
	}

	send(message, timestamp) {
		message = Midium.intToByteArray(message);

		this.ports.forEach(function (port) {
			if (port.type === 'output') {
				port.send(message, timestamp);
			}
		});

		return this;
	}

	addEventListener(event, mask, callback) {
		this.eventListeners.push({
			event     : Midium.byteArrayToInt(event),
			mask      : Midium.byteArrayToInt(mask),
			reference : Midium.listenerCounter,
			callback  : callback
		});

		return Midium.listenerCounter++;
	}

	removeEventListener(references) {
		Array.prototype.concat(references).forEach(function (reference) {
			this.eventListeners.forEach(function (listener, index) {
				if (listener.reference === reference) {
					this.eventListeners.splice(index, 1);
				}
			}, this);
		}, this);
	}

	_onMIDIMessage(event) {
		var data = Midium.byteArrayToInt(event.data);
		this.eventListeners.forEach(function (listener) {
			if ((data & listener.mask) === listener.event) {
				listener.callback(event);
			}
		}, this);
	}

	_onStateChange(event) {
	}
}

Midium.midiAccess = null;
Midium.isReady = false;
Midium.listenerCounter = 0;

export default Midium;
