import FakeInput from './fakeInput';
import FakeOutput from './fakeOutput';

class Midium {
	constructor(query) {
		this.eventListeners = [];
		this.ports = [];

		this.stateChangeRef = this._onStateChange.bind(this);
		this.midiMessageRef = this._onMIDIMessage.bind(this);

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
			query instanceof window.MIDIInput ||
			query instanceof FakeInput ||
			query instanceof FakeOutput
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

		if (byteArray.length === 1) {
			return byteArray[0] * 0x10000;
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
			port.addEventListener('statechange', this.stateChangeRef);
			port.addEventListener('midimessage', this.midiMessageRef);
			this.ports.push(port);
		}, this);

		return this;
	}

	removeReferences() {
		this.ports.forEach(function(port) {
			port.removeEventListener('midimessage', this.midiMessageRef);
			port.removeEventListener('statechange', this.stateChangeRef);
		});
	}

	send(message, delay) {
		message = Midium.intToByteArray(message);

		if (this.isBuffering) {
			this.buffer.push({
				message : message,
				delay   : delay
			});
		}

		if (typeof delay !== 'undefined') {
			delay += window.performance.now();
		}

		this.ports.forEach(function (port) {
			if (port.type === 'output') {
				port.send(message, delay);
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

	startBuffering() {
		if (!this.buffer) {
			this.buffer = [];
		}
		this.isBuffering = true;
		return this;
	}

	stopBuffering() {
		this.isBuffering = false;
		return this;
	}

	wait(delay) {
		if (!this.isBuffering) {
			return this;
		}
		this.buffer.push({
			message : null,
			delay   : delay
		});
		return this;
	}

	clearBuffer() {
		this.buffer = [];
		return this;
	}

	sendBuffer() {
		var delay = 0;

		this.buffer.forEach((message) => {
			if (typeof message.delay === "number") {
				delay += message.delay;
			}
			if (Array.isArray(message.message)) {
				this.send(message.message, delay);
			}
		}, this);

		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, delay);
		});
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
Midium.FakeInput = FakeInput;
Midium.FakeOutput = FakeOutput;

export default Midium;
