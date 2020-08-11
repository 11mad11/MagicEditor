import './style.scss';
import Core from 'Core/Core';
import * as THREE from "three";
import "regenerator-runtime/runtime.js";

console.groupCollapsed('modules');
requireAll(require.context('./modules/', true, /\.\/([^_].*?)\/_main\.js$/), loadScript);
console.groupEnd();

console.groupCollapsed('scripts');
requireAll(require.context('./scripts/', true, /\.js$/), loadScript);
console.groupEnd();

Core.eventBus.trigger('core.create');

Core._loadedPromise().then(function () {
	Core.blackboard.deltaTime = 0;
	Core.blackboard.elapsedTime = 0;
	
	Core.eventBus.trigger('core.registerComponent');
	Core.eventBus.trigger('core.addSystem');
	
	Core.eventBus.trigger('core.created');
	
	let clock = new THREE.Clock();
	gameLoop();
	
	function gameLoop() {
		Core.blackboard.deltaTime = clock.getDelta();
		Core.blackboard.elapsedTime += Core.blackboard.deltaTime;
		Core.ecs.tick();
		Core.ecs.runSystemGroup(Core.sysGroup.logic);
		Core.ecs.runSystemGroup(Core.sysGroup.physic);
		Core.ecs.runSystemGroup(Core.sysGroup.render);
		Core.ecs.runSystemGroup(Core.sysGroup.ui);
		requestAnimationFrame(gameLoop);
	}
});

/*
UTILS
 */
//const cache = {};
//function importAll (r) {r.keys().forEach(key => cache[key] = r(key));}
function requireAll(r, map = false) {
	if (map === false)
		return r.keys().map(r);
	return r.keys().map((key) => {
		map(key, r);
	});
}

function loadScript(key, ctx) {
	try {
		console.groupCollapsed(key);
		ctx(key);
		console.groupEnd();
	} catch (e) {
		console.groupEnd();
		console.error("Error while loading: " + key, e);
	}
}