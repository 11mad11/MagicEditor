
import * as ECS from '@fritzy/ecs';
import EventBus from './EventModule';
import UI from './UIModule';

let loadings = [];

class Core{
	
	constructor() {
		this.ui = new UI();
		this.eventBus = new EventBus();
		this.ecs = new ECS.ECS();
		this.blackboard = {};
		this.sysGroup = {
			logic: 'logic',
			physic: 'physic',
			render: 'render',
			ui: 'ui'
		};
		
	}
	
	loading(promise) {
		loadings.push(promise);
	}
	
	_loadedPromise(){
		let all = Promise.all(loadings);
		loadings = false;
		return all;
	}
}

let instance = new Core();

export default instance;