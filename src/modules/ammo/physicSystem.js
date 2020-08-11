import * as ECS from '@fritzy/ecs';
import Ammo from 'ammojs-typed';
import Core from 'Core/Core';

class PhysicSystem extends ECS.System {
	/**
	 * @property {object}  blackboard - injected
	 **/
	constructor(ecs) {
		super(ecs);
		
		this._createWorld();
		this.tmpTrans = new Ammo.btTransform();
	}
	
	update(tick, entities) {
		for (const change of this.changes) {//TODO apply force,ect..
			if (change.component.type !== 'PhysicalBody') break;
			if (change.op !== 'addComponent') break;
			const body = change.component.body;
			
			this.physicsWorld.addRigidBody(body);
		}
		
		this.physicsWorld.stepSimulation(Core.blackboard.deltaTime, 10);
		
		for (const entity of entities) {
			let objThree = entity.RenderedBody.body;
			let objAmmo = entity.PhysicalBody.body;
			let ms = objAmmo.getMotionState();
			if (ms) {
				ms.getWorldTransform(this.tmpTrans);
				let p = this.tmpTrans.getOrigin();
				let q = this.tmpTrans.getRotation();
				objThree.position.set(p.x(), p.y(), p.z());
				objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
			}
		}
	}
	
	_createWorld() {
		let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
			dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
			overlappingPairCache = new Ammo.btDbvtBroadphase(),
			solver = new Ammo.btSequentialImpulseConstraintSolver();
		
		this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		this.physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
	}
};

PhysicSystem.query = {
	has: ['PhysicalBody', 'RenderedBody'],
	//hasnt: ['Static']
};
PhysicSystem.subscriptions = ['PhysicalBody'];

export default PhysicSystem;