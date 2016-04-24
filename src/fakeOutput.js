import FakeInput from './fakeInput';

export default class FakeOutput {
	constructor() {
		this.connection = 'open';
		this.id = 0.1 + FakeInput.idCounter++;
		this.manufacturer = 'Midium Ltd.';
		this.name = 'Midium fake port';
		this.state = 'connected';
		this.type = 'output';
		this.version = '';

		this.inputs = [];
	}

	send(message, timestamp) {
		this.inputs.forEach((input) => {
			if (typeof input.onmidimessage !== 'function') {
				return;
			}

			if (timestamp) {
				timestamp = Math.floor(timestamp - window.performance.now());
			}
			else {
				timestamp = 0;
			}

			if (timestamp > 0) {
				setTimeout(() => {
					input.onmidimessage(this._contructEvent(message));
				}, timestamp);
			}
			else {
				input.onmidimessage(this._contructEvent(message));
			}
		});
	}

	_contructEvent(message) {
		return {data : message};
	}

	getInput() {
		let input = new FakeInput();
		this.inputs.push(input);
		return input;
	}
}
