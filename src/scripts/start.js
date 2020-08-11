import Ammo from 'ammojs-typed';
import * as THREE from 'three';
import Core from 'Core/Core';

let {
	ecs,
	eventBus
} = Core;

eventBus.on('core.createEntity', () => {
	createBlock(ecs);
	createBall(ecs);
});

function createBlock(ecs) {
	
	let pos = {x: 0, y: 0, z: 0};
	let scale = {x: 50, y: 2, z: 50};
	let quat = {x: 0, y: 0, z: 0, w: 1};
	let mass = 0;
	
	//threeJS Section
	let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));
	
	blockPlane.position.set(pos.x, pos.y, pos.z);
	blockPlane.scale.set(scale.x, scale.y, scale.z);
	
	blockPlane.castShadow = true;
	blockPlane.receiveShadow = true;
	
	//Ammojs Section
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	let motionState = new Ammo.btDefaultMotionState(transform);
	
	let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
	colShape.setMargin(0.05);
	
	let localInertia = new Ammo.btVector3(0, 0, 0);
	colShape.calculateLocalInertia(mass, localInertia);
	
	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
	let body = new Ammo.btRigidBody(rbInfo);
	
	ecs.createEntity({
		RenderedBody: {body: blockPlane},
		PhysicalBody: {body: body}
	});
}

function createBall(ecs) {
	
	let pos = {x: 0, y: 20, z: 0};
	let radius = 2;
	let quat = {x: 0, y: 0, z: 0, w: 1};
	let mass = 1;
	
	//threeJS Section
	let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));
	
	ball.position.set(pos.x, pos.y, pos.z);
	
	ball.castShadow = true;
	ball.receiveShadow = true;
	
	//Ammojs Section
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	let motionState = new Ammo.btDefaultMotionState(transform);
	
	let colShape = new Ammo.btSphereShape(radius);
	colShape.setMargin(0.05);
	
	let localInertia = new Ammo.btVector3(0, 0, 0);
	colShape.calculateLocalInertia(mass, localInertia);
	
	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
	let body = new Ammo.btRigidBody(rbInfo);
	
	ecs.createEntity({
		RenderedBody: {body: ball},
		PhysicalBody: {body: body}
	});
}