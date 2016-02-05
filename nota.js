/**
 * Constructor for a port colletion.
 *
 * @param {array} ports
 *
 * @returns {*}
 */
function Nota(ports) {
	this.eventListeners = [];
	this.ports = [];

	for (var i = 0; i < ports.length; i++) {
		this.add(ports[i]);
	}
}

/** @type {object} Midi access object. */
Nota.midiAccess = null;

Nota.isReady = false;

Nota.listenerCounter = 0;

/**
 * Calls back when the MIDI driver is ready.
 *
 * @param {function} callback    Calls when the MIDI connection is ready.
 * @param {function} errorCallback
 *
 * @returns {void}
 */
Nota.ready = function(callback, errorCallback) {
	if (Nota.isReady) {
		callback();
	}

	navigator.requestMIDIAccess({
		sysex : false
	}).then(

		/* MIDI access granted */
		function(midiAccess) {
			Nota.isReady = true;
			Nota.midiAccess = midiAccess;
			callback();
		},

		/* MIDI access denied */
		function(error) {
			Nota.isReady = false;
			if (errorCallback) {
				errorCallback(error);
			}
		}
	);
};

/**
 * Returns with an array of MIDI inputs and outputs.
 *
 * @param {object|number|string|array} selector    Selector
 *
 * @returns {array}
 */
Nota.select = function(selector) {
	if (!Nota.isReady) {
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
		Nota.midiAccess.inputs.has(query)
	) {
		ports[0] = Nota.midiAccess.inputs.get(query);
	}

	else if (
		typeof query === 'number' &&
		Nota.midiAccess.outputs.has(query)
	) {
		ports[0] = Nota.midiAccess.outputs.get(query);
	}

	else if (selector instanceof Array) {
		selector.forEach(function(item) {
			ports.push(Nota.select(item)[0]);
		});
	}

	else if (
		typeof selector === 'string' ||
		selector instanceof window.RegExp
	) {
		var name = '';

		Nota.midiAccess.inputs.forEach(function each(port) {
			name = port.name + ' ' + port.manufacturer;
			if (new RegExp(selector, 'i').test(name)) {
				ports.push(port);
			}
		});

		Nota.midiAccess.outputs.forEach(function each(port) {
			name = port.name + ' ' + port.manufacturer;
			if (new RegExp(selector, 'i').test(name)) {
				ports.push(port);
			}
		});
	}

	return new Nota(ports);
};

/**
 * Converts byte array to 24 bit integer.
 *
 * @param {number|array} byteArray    Byte array
 *
 * @returns {void}
 */
Nota.byteArrayToInt = function(byteArray) {
	if (typeof byteArray === 'number') {
		return byteArray;
	}

	return byteArray[0] * 0x10000 + byteArray[1] * 0x100 + byteArray[2];
};

/**
 * Converts 24 bit integer to byte array.
 *
 * @param {number|array} int    24 bit integer
 *
 * @returns {void}
 */
Nota.intToByteArray = function(int) {
	if (typeof int === 'array') {
		return int;
	}

	return [int >> 16, (int >> 8) & 0x00ff,	int & 0x0000ff];
};

Nota.prototype = {
	/**
	 * Adds MIDI port to the collection.
	 *
	 * @param {object} port    MIDI port
	 *
	 * @returns {object} Reference of this for method chaining.
	 */
	add : function (port) {
		port.onstatechange = this._onStateChange.bind(this);
		port.onmidimessage = this._onMIDIMessage.bind(this);
		this.ports.push(port);

		return this;
	},

	/**
	 * Removes the references from the selected MIDI ports.
	 *
	 * @returns {void}
	 */
	removeReferences : function () {
		this.ports.forEach(function(port) {
			port.onmidimessage = null;
			port.onstatechange = null;
		})
	},

	/**
	 * Sends raw MIDI data.
	 *
	 * @param {number|array} message    24 bit byte array or integer
	 *
	 * @returns {object} Reference of this for method chaining.
	 */
	send : function (message) {
		message = Nota.intToByteArray(message);

		this.ports.forEach(function (port) {
			if (port.type === 'output') {
				port.send(message);
			}
		});

		return this;
	},

	/**
	 * Register an event listener.
	 *
	 * @param {number|array} event    24 bit byte array or integer
	 * @param {number|array} mask     24 bit byte array or integer
	 * @param {function} callback
	 *
	 * @returns {object} Returns with the reference of the event listener.
	 */
	addEventListener : function (event, mask, callback) {
		this.eventListeners.push({
			event     : Nota.byteArrayToInt(event),
			mask      : Nota.byteArrayToInt(mask),
			reference : Nota.listenerCounter,
			callback  : callback
		});

		return Nota.listenerCounter++;
	},

	/**
	 * Removes the given event listener or event listeners.
	 *
	 * @param {number|array} references    Event listener references.
	 *
	 * @returns {void}
	 */
	removeEventListener : function (references) {
		Array.prototype.concat(references).forEach(function (reference) {
			this.eventListeners.forEach(function (listener, index) {
				if (listener.reference === reference) {
					this.eventListeners.splice(index, 1);
				}
			}, this);
		}, this);
	},

	/**
	 * MIDI message event handler.
	 *
	 * @param {object} event    MIDI event data.
	 *
	 * @returns {void}
	 */
	_onMIDIMessage : function(event) {
		var data = Nota.byteArrayToInt(event.data);
		this.eventListeners.forEach(function (listener) {
			if ((data & listener.mask) === listener.event) {
				listener.callback(event);
			}
		}, this);
	},

	/**
	 * State change event handler.
	 *
	 * @param {object} event    State change event data.
	 *
	 * @returns {void}
	 */
	_onStateChange : function(event) {
		console.log('state', event);
	}
};

if (typeof module !== 'undefined') {
	module.exports = Nota;
}
else {
	window.Nota = Nota;
}
