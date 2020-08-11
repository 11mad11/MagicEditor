export default class {
	#prefix = 'Layer_';
	
	constructor() {
		this.levels = [];
		
	}
	
	layer(name, level = 0) {
		let div = document.getElementById(this.#prefix + name);
		if (div)
			return div;
		
		div = document.createElement("div");
		div.style.zIndex = level;
		div.style.width = '100vw';
		div.style.height = '100vh';
		div.id = this.#prefix + name;
		document.body.append(div);
		return div;
	}
}