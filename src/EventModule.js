export default class {
	constructor() {
		this.events = {};
	}
	
	on(event, fn) {
		if (!this.events[event])
			this.events[event] = [];
		this.events[event].push(fn);
	}
	
	trigger(event, ctx = undefined) {
		if (!this.events[event])
			return;
		for (let fn of this.events[event])
			fn(ctx);
	}
}