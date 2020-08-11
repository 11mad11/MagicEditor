import Core from "Core/Core";
import * as Renderer from './Renderer.js';
import * as RenderedBody from './RenderedBody.js';
import * as THREE from "three";

Core.eventBus.on('core.registerComponent',function(){
	Core.ecs.registerComponent(RenderedBody.name,RenderedBody.definition);
});

Core.eventBus.on('core.addSystem',function(){
	Core.ecs.addSystem(Core.sysGroup.render,Renderer.system);
});