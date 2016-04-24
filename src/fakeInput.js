export default class FakeInput {
	constructor() {
		this.connection = 'open';
		this.id = 0.1 + FakeInput.idCounter++;
		this.manufacturer = 'Midium Ltd.';
		this.name = 'Midium fake port';
		this.onmidimessage = null;
		this.onstatuschange = null;
		this.state = 'connected';
		this.type = 'input';
		this.version = '';
	}
}

FakeInput.idCounter = 0;
