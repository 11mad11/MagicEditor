import Core from "Core/Core";
import * as ECS from '@fritzy/ecs';
import * as THREE from 'three';

export let group = "render";
export let system = class extends ECS.System {
	
	constructor(ecs) {
		super(ecs);
		this.setupGraphics();
		Core.blackboard.scene = this.scene;
	}
	
	update(tick, entities) {
		for (const change of this.changes) {
			if (change.component.type !== 'RenderedBody') break;
			if (change.op !== 'addComponent') break;
			const body = change.component.body;
			this.scene.add(body);
		}
		this.control.update(Core.blackboard.deltaTime * 10);
		this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
		this.camera.getWorldDirection(this.axesHelper.position);
		this.axesHelper.position.add(this.camera.position);
		this.renderer.render(this.scene, this.camera);
	}
	
	setupGraphics() {
		//create the scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xbfd1e5);
		
		//create camera
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
		
		this.camera.position.set(-20, 20, 20);
		this.control = new FlyControls(this.camera, document.body);
		this.control.update(Core.blackboard.deltaTime * 10);
		this.camera.modelViewMatrix.lookAt(this.camera.position, new THREE.Vector3(20, 20, 20), new THREE.Vector3(0, 1, 0))
		this.camera.quaternion.setFromRotationMatrix(this.camera.modelViewMatrix);
		
		this.light = new THREE.PointLight(0xff00ff, 1, 20);
		this.scene.add(this.light);
		
		this.axesHelper = new THREE.AxesHelper(.1);
		this.scene.add(this.axesHelper);//The X axis is red. The Y axis is green. The Z axis is blue.
		
		let helper = new THREE.CameraHelper(this.camera);
		this.scene.add(helper);
		
		//Add hemisphere light
		let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
		hemiLight.color.setHSL(0.6, 0.6, 0.6);
		hemiLight.groundColor.setHSL(0.1, 1, 0.4);
		hemiLight.position.set(0, 50, 0);
		this.scene.add(hemiLight);
		
		//Add directional light
		let dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.color.setHSL(0.1, 1, 0.95);
		dirLight.position.set(-1, 1.75, 1);
		dirLight.position.multiplyScalar(100);
		this.scene.add(dirLight);
		
		dirLight.castShadow = true;
		
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		
		let d = 50;
		
		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;
		
		dirLight.shadow.camera.far = 13500;
		
		//Setup the renderer
		//let layer = Core.ui.layer('render');
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0xbfd1e5);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		//layer.appendChild(this.renderer.domElement);
		//this.renderer.setSize(layer.width, layer.height);
		// layer.addEventListener('resize',() => {
		// 	this.renderer.setPixelRatio(window.devicePixelRatio);
		// 	this.renderer.setSize(layer.width, layer.height);
		// });
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		
		this.renderer.shadowMap.enabled = true;
	}
};

system.query = {
	has: [''],
	//hasnt: ['Static']
};
system.subscriptions = ['RenderedBody'];

function AxesHelper(size) {
	
	size = size || 1;
	
	const vertices = [
		0, 0, 0, size, 0, 0,
		0, 0, 0, 0, size, 0,
		0, 0, 0, 0, 0, size
	];
	
	const colors = [
		1, 0, 0, 1, 0.6, 0,
		0, 1, 0, 0.6, 1, 0,
		0, 0, 1, 0, 0.6, 1
	];
	
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	
	const material = new THREE.LineBasicMaterial({vertexColors: true, toneMapped: false});
	
	THREE.LineSegments.call(this, geometry, material);
	
	this.type = 'AxesHelper';
	
}

AxesHelper.prototype = Object.create(THREE.LineSegments.prototype);
AxesHelper.prototype.constructor = AxesHelper;

let FlyControls = function (object, domElement) {
	
	if (domElement === undefined) {
		
		console.warn('THREE.FlyControls: The second parameter "domElement" is now mandatory.');
		domElement = document;
		
	}
	
	this.object = object;
	this.domElement = domElement;
	
	if (domElement) this.domElement.setAttribute('tabindex', -1);
	
	// API
	
	this.movementSpeed = 1.0;
	this.rollSpeed = 0.05;
	
	this.dragToLook = true;
	this.autoForward = false;
	
	// disable default target object behavior
	
	// internals
	
	this.tmpQuaternion = new THREE.Quaternion();
	
	this.mouseStatus = 0;
	
	this.moveState = {up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0};
	this.moveVector = new THREE.Vector3(0, 0, 0);
	this.rotationVector = new THREE.Vector3(0, 0, 0);
	
	this.keydown = function (event) {
		
		if (event.altKey) {
			
			return;
			
		}
		
		//event.preventDefault();
		
		switch (event.keyCode) {
			
			case 16: /* shift */
				this.movementSpeedMultiplier = .1;
				break;
			
			case 87: /*W*/
				this.moveState.forward = 1;
				break;
			case 83: /*S*/
				this.moveState.back = 1;
				break;
			
			case 65: /*A*/
				this.moveState.left = 1;
				break;
			case 68: /*D*/
				this.moveState.right = 1;
				break;
			
			case 82: /*R*/
				this.moveState.up = 1;
				break;
			case 70: /*F*/
				this.moveState.down = 1;
				break;
			
			case 38: /*up*/
				this.moveState.pitchUp = 1;
				break;
			case 40: /*down*/
				this.moveState.pitchDown = 1;
				break;
			
			case 37: /*left*/
				this.moveState.yawLeft = 1;
				break;
			case 39: /*right*/
				this.moveState.yawRight = 1;
				break;
			
			case 81: /*Q*/
				this.moveState.rollLeft = 1;
				break;
			case 69: /*E*/
				this.moveState.rollRight = 1;
				break;
			
		}
		
		this.updateMovementVector();
		this.updateRotationVector();
		
	};
	
	this.keyup = function (event) {
		
		switch (event.keyCode) {
			
			case 16: /* shift */
				this.movementSpeedMultiplier = 1;
				break;
			
			case 87: /*W*/
				this.moveState.forward = 0;
				break;
			case 83: /*S*/
				this.moveState.back = 0;
				break;
			
			case 65: /*A*/
				this.moveState.left = 0;
				break;
			case 68: /*D*/
				this.moveState.right = 0;
				break;
			
			case 82: /*R*/
				this.moveState.up = 0;
				break;
			case 70: /*F*/
				this.moveState.down = 0;
				break;
			
			case 38: /*up*/
				this.moveState.pitchUp = 0;
				break;
			case 40: /*down*/
				this.moveState.pitchDown = 0;
				break;
			
			case 37: /*left*/
				this.moveState.yawLeft = 0;
				break;
			case 39: /*right*/
				this.moveState.yawRight = 0;
				break;
			
			case 81: /*Q*/
				this.moveState.rollLeft = 0;
				break;
			case 69: /*E*/
				this.moveState.rollRight = 0;
				break;
			
		}
		
		this.updateMovementVector();
		this.updateRotationVector();
		
	};
	
	this.mousedown = function (event) {
		
		if (this.domElement !== document) {
			
			this.domElement.focus();
			
		}
		
		event.preventDefault();
		event.stopPropagation();
		
		if (this.dragToLook) {
			
			this.mouseStatus++;
			
		} else {
			
			switch (event.button) {
				
				case 0:
					this.moveState.forward = 1;
					break;
				case 2:
					this.moveState.back = 1;
					break;
				
			}
			
			this.updateMovementVector();
			
		}
		
	};
	
	this.mousemove = function (event) {
		
		if (!this.dragToLook || this.mouseStatus > 0) {
			
			var container = this.getContainerDimensions();
			var halfWidth = container.size[0] / 2;
			var halfHeight = container.size[1] / 2;
			
			this.moveState.yawLeft = -((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
			this.moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;
			
			this.updateRotationVector();
			
		}
		
	};
	
	this.mouseup = function (event) {
		
		event.preventDefault();
		event.stopPropagation();
		
		if (this.dragToLook) {
			
			this.mouseStatus--;
			
			this.moveState.yawLeft = this.moveState.pitchDown = 0;
			
		} else {
			
			switch (event.button) {
				
				case 0:
					this.moveState.forward = 0;
					break;
				case 2:
					this.moveState.back = 0;
					break;
				
			}
			
			this.updateMovementVector();
			
		}
		
		this.updateRotationVector();
		
	};
	
	this.update = function (delta) {
		
		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;
		
		this.object.translateX(this.moveVector.x * moveMult);
		this.object.translateY(this.moveVector.y * moveMult);
		this.object.translateZ(this.moveVector.z * moveMult);
		
		this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
		this.object.quaternion.multiply(this.tmpQuaternion);
		
		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
		
	};
	
	this.updateMovementVector = function () {
		
		var forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;
		
		this.moveVector.x = (-this.moveState.left + this.moveState.right);
		this.moveVector.y = (-this.moveState.down + this.moveState.up);
		this.moveVector.z = (-forward + this.moveState.back);
		
		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
		
	};
	
	this.updateRotationVector = function () {
		
		this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
		this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
		this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
		
		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
		
	};
	
	this.getContainerDimensions = function () {
		
		if (this.domElement != document) {
			
			return {
				size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
				offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
			};
			
		} else {
			
			return {
				size: [window.innerWidth, window.innerHeight],
				offset: [0, 0]
			};
			
		}
		
	};
	
	function bind(scope, fn) {
		
		return function () {
			
			fn.apply(scope, arguments);
			
		};
		
	}
	
	function contextmenu(event) {
		
		event.preventDefault();
		
	}
	
	this.dispose = function () {
		
		this.domElement.removeEventListener('contextmenu', contextmenu, false);
		this.domElement.removeEventListener('mousedown', _mousedown, false);
		this.domElement.removeEventListener('mousemove', _mousemove, false);
		this.domElement.removeEventListener('mouseup', _mouseup, false);
		
		window.removeEventListener('keydown', _keydown, false);
		window.removeEventListener('keyup', _keyup, false);
		
	};
	
	var _mousemove = bind(this, this.mousemove);
	var _mousedown = bind(this, this.mousedown);
	var _mouseup = bind(this, this.mouseup);
	var _keydown = bind(this, this.keydown);
	var _keyup = bind(this, this.keyup);
	
	this.domElement.addEventListener('contextmenu', contextmenu, false);
	
	this.domElement.addEventListener('mousemove', _mousemove, false);
	this.domElement.addEventListener('mousedown', _mousedown, false);
	this.domElement.addEventListener('mouseup', _mouseup, false);
	
	window.addEventListener('keydown', _keydown, false);
	window.addEventListener('keyup', _keyup, false);
	
	this.updateMovementVector();
	this.updateRotationVector();
	
};
