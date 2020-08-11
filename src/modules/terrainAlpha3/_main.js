import Core from "Core/Core";
import * as THREE from "three";
import Wroker from './generators/a.worker';
import * as ECS from "@fritzy/ecs";

const chunkSize = 10;
const w = 100;//multiple of chunkSize
const h = 100;//multiple of chunkSize
const d = 100;//multiple of chunkSize
const nodes = [];
const geo = new THREE.Geometry();

Core.eventBus.on('core.created', function () {
	
	const material = new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors});
	const materialWire = new THREE.MeshNormalMaterial({wireframe: true});
	const materialPoints = new THREE.PointsMaterial({color: 0xFF0000});
	const materialLine = new THREE.LineBasicMaterial({color: 0x0000ff});
	
	const points = new THREE.Mesh(geo, material);
	points.alwaysSelectAsActiveMesh = true;
	points.frustumCulled = false;
	
	Core.blackboard.scene.add(points);
});

Core.eventBus.on('core.addSystem', function () {
	const worker = new Wroker();
	//let stop = false;
	let todos = [];
	let toSend = [];
	let sendedNotFinished = 0
	
	worker.onmessage = (event) => {
		const vertices = event.data.vertices;
		const faces = event.data.faces;
		todos.push(() => {
			let offset = geo.vertices.length;
			for (let v of vertices)
				geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
			for (let v of faces)
				geo.faces.push(new THREE.Face3(v.a + offset, v.b + offset, v.c + offset, undefined, new THREE.Color(v.color)));
		});
	};
	
	for (let y = 0; y < h / chunkSize; y++) {
		for (let z = 0; z < d / chunkSize; z++) {
			for (let x = 0; x < w / chunkSize; x++) {
				toSend.push({
					chunk: {
						x: x * chunkSize,
						y: y * chunkSize,
						z: z * chunkSize,
						w: chunkSize,
						h: chunkSize,
						d: chunkSize
					},
					options: {
						islandSize: 100/2,
						centerVec: new THREE.Vector3(w / 2, h / 2, d / 2),
						blocky: false,
						frequency: .1,
						lacunarity: .5,
						persistence: 0.5,
						octaves: 8,
						seed: 42
					}
				});
			}
		}
	}
	
	let dirty = false;
	let updateStep = 0;
	let lastVert = 0;
	Core.ecs.addSystem('logic', class extends ECS.System {
		update(tick) {
			if ((dirty || updateStep) && tick % 5 == 0) {
				updateStep++;
				//console.log(dirty, updateStep);
				switch (updateStep) {
					case 1:
						dirty = false;
						geo.verticesNeedUpdate = true;
						break;
					case 2:
						geo.computeFaceNormals();
						geo.normalsNeedUpdate = true;
						break;
					case 3:
						geo.elementsNeedUpdate = true;
						break;
					case 4:
						geo.morphTargetsNeedUpdate = true;
						break;
					case 5:
						geo.uvsNeedUpdate = true;
						geo.colorsNeedUpdate = true;
						geo.tangentsNeedUpdate = true;
						break;
					default:
						updateStep = 0;
				}
			}
			
			if (sendedNotFinished < 5 && toSend.length > 0) {
				worker.postMessage(toSend.pop());
				sendedNotFinished++;
			}
			
			if (!todos.length)
				return;
			todos.pop()();
			sendedNotFinished--;
			dirty = true;
		}
	});
	
	function output(x, y, z, val) {
		nodes[(h * w * z) + (w * y) + x] = val
	};
});