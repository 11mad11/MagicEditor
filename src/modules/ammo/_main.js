import Core from "Core/Core";
import PhysicSystem from './physicSystem.js';
import * as PhysicalBody from './PhysicalBody.js';
import Ammo from "ammojs-typed";



Core.eventBus.on('core.registerComponent',function(){
	Core.ecs.registerComponent(PhysicalBody.name,PhysicalBody.definition);
});

Core.eventBus.on('core.addSystem',function(){
	Core.ecs.addSystem(Core.sysGroup.physic,PhysicSystem);
});

Core.loading(loadAmmo());

function loadAmmo() {
	return Ammo(Ammo).then(() => {
		Core.eventBus.trigger('Ammo.loaded',Ammo);
	});
}