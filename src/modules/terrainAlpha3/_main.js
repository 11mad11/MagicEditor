import Core from "Core/Core";
import * as THREE from "three";
import aWorker from './generators/a.worker';
import * as ECS from "@fritzy/ecs";

const chunkSize = 20;
const w = 200;//multiple of chunkSize
const h = 200;//multiple of chunkSize
const d = 200;//multiple of chunkSize
const nodes = [];

const material = new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors});
const materialWire = new THREE.MeshNormalMaterial({wireframe: true});
const materialPoints = new THREE.PointsMaterial({color: 0xFF0000});
const materialLine = new THREE.LineBasicMaterial({color: 0x0000ff});

Core.eventBus.on('core.created', function () {
	for (let x = 0; x < w; x += chunkSize) {
		for (let y = 0; y < h; y += chunkSize) {
			for (let z = 0; z < d; z += chunkSize) {
				let scaleAxes = new THREE.AxesHelper(1);
				scaleAxes.position.set(x, y, z);
				Core.blackboard.scene.add(scaleAxes);//scale
			}
		}
	}
	
});

Core.eventBus.on('core.addSystem', function () {
	const workersInfo = [];
	//let stop = false;
	let todos = [];
	let toSend = [];
	
	for (let i = 0; i < 5; i++) {
		const info = workersInfo[i] = {
			worker: new aWorker(),
			jobCount: 0
		};
		info.worker.onmessage = (event) => {
			info.jobCount--;
			const vertices = event.data.vertices;
			const faces = event.data.faces;
			if (faces.length === 0) {
				//console.log(event);
				return;
			}
			todos.push(() => {
				let geo = new THREE.Geometry();
				let offset = 0;
				for (let v of vertices)
					geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
				for (let v of faces)
					geo.faces.push(new THREE.Face3(v.a + offset, v.b + offset, v.c + offset, undefined, new THREE.Color(v.color)));
				
				const points = new THREE.Mesh(geo, material);
				Core.blackboard.scene.add(points);
				geo.computeFaceNormals();
				return geo;
			});
		};
	}
	
	for (let z = 0; z < d / chunkSize; z++) {
		for (let y = 0; y < h / chunkSize; y++) {
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
						islandSize: h,
						centerVec: new THREE.Vector3(w / 2, h / 2, d / 2),
						blocky: false,
						frequency: .05,
						lacunarity: 1,
						persistence: .1,
						octaves: 1,
						seed: 42
					}
				});
			}
		}
	}
	
	let updateStep = 0;
	let lastVert = 0;
	Core.ecs.addSystem('logic', class extends ECS.System {
		update(tick) {
			for (const info of workersInfo) {
				if (info.jobCount < 3 && toSend.length > 0) {
					info.worker.postMessage(toSend.pop());
					info.jobCount++;
				}
			}
			
			if (!todos.length)
				return;
			todos.pop()();
		}
	});
	
	function output(x, y, z, val) {
		nodes[(h * w * z) + (w * y) + x] = val
	};
});