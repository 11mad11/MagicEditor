import Core from "Core/Core";

Core.eventBus.on('core.registerComponent',function(){
	Core.ecs.registerComponent('Position',{
		properties: {
			vector: {x:0,y:0,z:0}
		},
		multiset: false,
		serilize: {
			skip: false,
		},
	});
});