class Midium {
	/**
	 * Constructor for a port colletion.
	 *
	 * @param {array} ports
	 *
	 * @returns {*}
	 */
	constructor(ports) {
		this.eventListeners = [];
		this.ports = [];

		for (var i = 0; i < ports.length; i++) {
			this.add(ports[i]);
		}
	}

	/**
	 * Calls back when the MIDI driver is ready.
	 *
	 * @param {function} callback    Calls when the MIDI connection is ready.
	 * @param {function} errorCallback
	 *
	 * @returns {void}
	 */
	static ready(callback, errorCallback) {
		if (Midium.isReady) {
			callback();
		}

		navigator.requestMIDIAccess({
			sysex : false
		}).then(

			/* MIDI access granted */
			function(midiAccess) {
				Midium.isReady = true;
				Midium.midiAccess = midiAccess;
				callback();
			},

			/* MIDI access denied */
			function(error) {
				Midium.isReady = false;
				if (errorCallback) {
					errorCallback(error);
				}
			}
		);
	}

	/**
	 * Returns with an array of MIDI inputs and outputs.
	 *
	 * @param {object|number|string|array} selector    Selector
	 *
	 * @returns {array}
	 */
	static select(selector) {
		if (!Midium.isReady) {
			return [];
		}

		var ports = [];

		/* If the query is a MIDIInput or output. */
		if (
			selector instanceof window.MIDIOutput ||
			selector instanceof window.MIDIInput
		) {
			ports[0] = selector;
		}

		else if (
			typeof selector === 'number' &&
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

		else if (selector instanceof Array) {
			selector.forEach(function(item) {
				ports.push(Midium.select(item)[0]);
			});
		}

		else if (
			typeof selector === 'string' ||
			selector instanceof window.RegExp
		) {
			var name = '';

			Midium.midiAccess.inputs.forEach(function each(port) {
				name = port.name + ' ' + port.manufacturer;
				if (new RegExp(selector, 'i').test(name)) {
					ports.push(port);
				}
			});

			Midium.midiAccess.outputs.forEach(function each(port) {
				name = port.name + ' ' + port.manufacturer;
				if (new RegExp(selector, 'i').test(name)) {
					ports.push(port);
				}
			});
		}

		return new Midium(ports);
	}

	/**
	 * Adds MIDI port to the collection.
	 *
	 * @param {object} port    MIDI port
	 *
	 * @returns {object} Reference of this for method chaining.
	 */
	add(port) {
		port.onstatechange = this._onStateChange.bind(this);
		port.onmidimessage = this._onMIDIMessage.bind(this);
		this.ports.push(port);

		return this;
	}

	/**
	 * Removes the references from the selected MIDI ports.
	 *
	 * @returns {void}
	 */
	removeReferences() {
		this.ports.forEach(function(port) {
			port.onmidimessage = null;
			port.onstatechange = null;
		})
	}

	/**
	 * Sends raw MIDI data.
	 *
	 * @param {number|array} message    24 bit byte array or integer
	 *
	 * @returns {object} Reference of this for method chaining.
	 */
	send(message) {
		message = Midium.intToByteArray(message);

		this.ports.forEach(function (port) {
			if (port.type === 'output') {
				port.send(message);
			}
		});

		return this;
	}

	/**
	 * Register an event listener.
	 *
	 * @param {number|array} event    24 bit byte array or integer
	 * @param {number|array} mask     24 bit byte array or integer
	 * @param {function} callback
	 *
	 * @returns {object} Returns with the reference of the event listener.
	 */
	addEventListener(event, mask, callback) {
		this.eventListeners.push({
			event     : Midium.byteArrayToInt(event),
			mask      : Midium.byteArrayToInt(mask),
			reference : Midium.listenerCounter,
			callback  : callback
		});

		return Midium.listenerCounter++;
	}

	/**
	 * Removes the given event listener or event listeners.
	 *
	 * @param {number|array} references    Event listener references.
	 *
	 * @returns {void}
	 */
	removeEventListener(references) {
		Array.prototype.concat(references).forEach(function (reference) {
			this.eventListeners.forEach(function (listener, index) {
				if (listener.reference === reference) {
					this.eventListeners.splice(index, 1);
				}
			}, this);
		}, this);
	}

	/**
	 * MIDI message event handler.
	 *
	 * @param {object} event    MIDI event data.
	 *
	 * @returns {void}
	 */
	_onMIDIMessage(event) {
		var data = Midium.byteArrayToInt(event.data);
		this.eventListeners.forEach(function (listener) {
			if ((data & listener.mask) === listener.event) {
				listener.callback(event);
			}
		}, this);
	}

	/**
	 * State change event handler.
	 *
	 * @param {object} event    State change event data.
	 *
	 * @returns {void}
	 */
	_onStateChange(event) {
		console.log('state', event);
	}
}

Midium.midiAccess = null;
Midium.isReady = false;
Midium.listenerCounter = 0;

export default Midium;
