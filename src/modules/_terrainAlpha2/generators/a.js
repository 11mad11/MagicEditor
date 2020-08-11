import {libnoise} from "libnoise";
import * as THREE from "three";

/**
 *
 * @param {Object} chunk
 * @param {Number} chunk.x
 * @param {Number} chunk.y
 * @param {Number} chunk.z
 * @param {Number} chunk.w
 * @param {Number} chunk.h
 * @param {Number} chunk.d
 * @param {outputCb} output
 *
 */

export default function (chunk, output, options) {
	let quality = libnoise.QualityMode.MEDIUM;
	//let noise = new libnoise.generator.Perlin(.01, 2.0, 0.5, 8, 42, quality);
	let noise = new libnoise.generator.Perlin(.1, 2.0, 0.5, 8, 42, quality);
	
	for (let y = chunk.y; y < chunk.h + chunk.y; y++) {
		for (let z = chunk.z; z < chunk.d + chunk.z; z++) {
			for (let x = chunk.x; x < chunk.w + chunk.x; x++) {
				let vec = new THREE.Vector3(x, y, z);
				
				let val = (1 + noise.getValue(x, y, z)) / 2;
				
				let length = vec.distanceTo(options.centerVec);
				length /= options.islandSize;
				//val *= clamp(-Math.log(length));//sphere
				
				//val *= clamp(-Math.log((y + 50) / chunk.h));//sphere
				//val *= clamp(ycap);
				
				output(x, y, z, val);
			}
		}
	}
}

function clamp(v, a = 0, b = 1) {
	return Math.max(Math.min(v, b), a)
}

/**
 * @callback outputCb
 * @param {Number} x - absolute
 * @param {Number} y - absolute
 * @param {Number} z - absolute
 * @param {Number} val
 */
