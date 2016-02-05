/**
 * Shorthand for nota static functions.
 *
 * @param {array} devices
 * @returns {*}
 */
function Nota(devices) {
	this.eventListeners = [];
	this.devices = [];

	for (var i = 0; i < devices.length; i++) {
		this.add(devices[i]);
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
 * @returns {void}
 */
Nota.ready = function(callback) {
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
			console.log(error);
		}
	);
};

/**
 * Returns with an array of MIDI inputs and outputs.
 *
 * @param {object|number|string|array} selector    Selector
 * @returns {array}
 */
Nota.select = function(selector) {
	if (!Nota.isReady) {
		return [];
	}

	var devices = [];

	/* If the query is a MIDIInput or output. */
	if (
		selector instanceof window.MIDIOutput ||
		selector instanceof window.MIDIInput
	) {
		devices[0] = selector;
	}

	else if (
		typeof selector === 'number' &&
		Nota.midiAccess.inputs.has(query)
	) {
		devices[0] = Nota.midiAccess.inputs.get(query);
	}

	else if (
		typeof query === 'number' &&
		Nota.midiAccess.outputs.has(query)
	) {
		devices[0] = Nota.midiAccess.outputs.get(query);
	}

	else if (selector instanceof Array) {
		selector.forEach(function(item) {
			devices.push(Nota.select(item)[0]);
		});
	}

	else if (
		typeof selector === 'string' ||
		selector instanceof window.RegExp
	) {
		var name = '';

		Nota.midiAccess.inputs.forEach(function each(device) {
			name = device.name + ' ' + device.manufacturer;
			if (new RegExp(selector, 'i').test(name)) {
				devices.push(device);
			}
		});

		Nota.midiAccess.outputs.forEach(function each(device) {
			name = device.name + ' ' + device.manufacturer;
			if (new RegExp(selector, 'i').test(name)) {
				devices.push(device);
			}
		});
	}

	return new Nota(devices);
};

Nota.prototype = {
	/**
	 * Adds MIDI device to the collection.
	 *
	 * @param {object} device    MIDI device
	 * @returns {object} Reference of this for method chaining.
	 */
	add : function (device) {
		device.onstatechange = this._onStateChange.bind(this);
		device.onmidimessage = this._onMIDIMessage.bind(this);
		this.devices.push(device);

		return this;
	},

	/**
	 * Removes the references from the selected MIDI devices.
	 *
	 * @returns {void}
	 */
	removeReferences : function () {
		this.devices.forEach(function(device) {
			device.onmidimessage = null;
			device.onstatechange = null;
		})
	},

	/**
	 * Sends raw MIDI data
	 *
	 * @param {array} midiData    Array of MIDI data
	 * @returns {object} Reference of this for method chaining.
	 */
	send : function (midiData) {
		this.devices.forEach(function (device) {
			if (device.type === 'output') {
				device.send(midiData);
			}
		});

		return this;
	},

	/**
	 * Register an event listener.
	 *
	 * @param {object} options    Event listener options.
	 * @returns {object} Returns with the reference of the event listener.
	 */
	addEventListener : function (event, mask, callback) {
		this.eventListeners.push({
			event     : event,
			mask      : mask,
			reference : Nota.listenerCounter,
			callback  : callback
		});

		return Nota.listenerCounter++;
	},

	/**
	 * Removes the given event listener or event listeners.
	 *
	 * @param {number|array} references    Event listener references.
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
	 * @returns {void}
	 */
	_onMIDIMessage : function (event) {
		var data = event.data[0] * 0xffff +
			event.data[1] * 0xff +
			event.data[2];

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
