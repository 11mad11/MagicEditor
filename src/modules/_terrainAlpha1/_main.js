// import Core from "Core/Core";
// import * as THREE from "three";
// import * as PhysicalBody from "Core/modules/ammo/PhysicalBody";
//
// // Core.eventBus.on('core.created', function () {
// // 	const geo = new THREE.Geometry();
// // 	const mat = new THREE.MeshNormalMaterial({wireframe: true});
// // 	const terrain = new THREE.Mesh(geo, mat);
// //
// // 	genGeo(geo);
// //
// // 	var material = new THREE.PointsMaterial({color: 0xFF0000});
// // 	var points = new THREE.Points(geo, material);
// //
// // 	Core.blackboard.scene.add(points);
// // });
//
// function genGeo(geo) {
// 	const map_radius = 5;
// 	let map = [];
// 	for (let q = -map_radius; q <= map_radius; q++) {
// 		let r1 = Math.max(-map_radius, -q - map_radius);
// 		let r2 = Math.min(map_radius, -q + map_radius);
// 		for (let r = r1; r <= r2; r++) {
// 			map.push(new Hex(q, r));
// 		}
// 	}
// }
//
// console.log("i:", new Hex(2, 5).indice(10, 10, false));
//
// const hex_triangle_offset = [
// 	[+2, -1],
// 	[+1, +1],
// 	[-1, +2],
// 	[-2, +1],
// 	[-1, -1],
// 	[+1, -2],
// ];
//
// const hex_directions = [
// 	new Hex(1, 0),
// 	new Hex(1, -1),
// 	new Hex(0, -1),
// 	new Hex(-1, 0),
// 	new Hex(-1, 1),
// 	new Hex(0, 1)
// ];
//
// const hex_const = {
// 	size: {
// 		x: 1,
// 		y: 1
// 	},
// 	f0: 3.0 / 2.0,
// 	f1: 0.0,
// 	f2: Math.sqrt(3.0) / 2.0,
// 	f3: Math.sqrt(3.0),
// 	b0: 2.0 / 3.0,
// 	b1: 0.0,
// 	b2: -1.0 / 3.0,
// 	b3: Math.sqrt(3.0) / 3.0,
// 	start_angle: 0.0,
// };
//
// class Hex {
// 	#corners = false;
//
// 	constructor(q, r, round = false) {
// 		if (round) {
// 			let round = {
// 				q: Math.round(q),
// 				r: Math.round(r),
// 				s: Math.round(-q - r),
// 			}
// 			let q_diff = Math.abs(round.q - q);
// 			let r_diff = Math.abs(round.r - r);
// 			let s_diff = Math.abs(round.s - (-q - r));
// 			if (q_diff > r_diff && q_diff > s_diff) {
// 				round.q = -round.r - round.s;
// 			} else if (r_diff > s_diff) {
// 				round.r = -round.q - round.s;
// 			} else {
// 				round.s = -round.q - round.r;
// 			}
// 			this.q = round.q;
// 			this.r = round.r;
// 			this.s = round.s;
// 		} else {
// 			this.q = q;
// 			this.r = r;
// 			this.s = -q - r;
// 		}
// 	}
//
// 	indice(w, h, corner) {
// 		let u = this.q * hex_triangle_offset[(this.q > 0 ? 0 : 3) + 1][0];
// 		u += this.r * hex_triangle_offset[(this.r > 0 ? 5 : 2) + 1][0];
// 		let v = this.q * hex_triangle_offset[(this.q > 0 ? 0 : 3) + 1][0];
// 		v += this.r * hex_triangle_offset[(this.r > 0 ? 5 : 2) + 1][0];
// 		let len = (2 * w + 1) * (h + 1) + (h - 1) + (w * h);
//
// 		return u * w + v;
// 	}
//
// 	corners() {
// 		if (this.#corners)
// 			return this.#corners;
// 		this.#corners = [];
// 		const center = this.toPixel();
// 		for (let i = 0; i < 6; i++) {
// 			const offset = this.cornerOffset(i);
// 			this.#corners.push({
// 				x: center.x + offset.x,
// 				y: center.y + offset.y
// 			});
// 		}
// 		return this.#corners;
// 	}
//
// 	cornerOffset(corner) {
// 		let angle = 2.0 * Math.PI * (hex_const.start_angle + corner) / 6;
// 		return {x: hex_const.size.x * Math.cos(angle), y: hex_const.size.y * Math.sin(angle)};
// 	}
//
// 	toPixel() {
// 		const x = (hex_const.f0 * this.q + hex_const.f1 * this.r) * hex_const.size.x;
// 		const y = (hex_const.f2 * this.q + hex_const.f3 * this.r) * hex_const.size.y;
// 		return {x, y};
// 	}
//
// 	hex_rotate_left() {
// 		return new Hex(-this.s, -this.q);
// 	}
//
// 	hex_rotate_right() {
// 		return new Hex(-this.r, -this.s);
// 	}
//
// 	direction(direction) {
// 		return hex_directions[(6 + (direction % 6)) % 6];
// 	}
//
// 	neighbor(direction) {
// 		return this.add(this.direction(direction));
// 	}
//
// 	lerp(b, t) {
// 		return new Hex(lerp(this.q, b.q, t), lerp(this.r, b.r, t), true);
// 	}
//
// 	length() {
// 		return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
// 	}
//
// 	distance(b) {
// 		return (Math.abs(this.q - b.q) + Math.abs(this.r - b.r) + Math.abs(this.s - b.s)) / 2;
// 	}
//
// 	add(b) {
// 		return new Hex(this.q + b.q, this.r + b.r);
// 	}
//
// 	subtract(b) {
// 		return new Hex(this.q - b.q, this.r - b.r);
// 	}
//
// 	multiply(k) {
// 		return new Hex(this.q * k, this.r * k);
// 	}
//
// 	equal(b) {
// 		return this?.q === b?.q && this?.r === b?.r && this?.s === b?.s;
// 	}
//
// 	notEqual(b) {
// 		return this?.q !== b?.q || this?.r !== b?.r || this?.s !== b?.s;
// 	}
//
// 	static fromPixel(x, y) {
// 		x /= hex_const.size.x;
// 		y /= hex_const.size.y;
// 		let q = hex_const.b0 * x + hex_const.b1 * y;
// 		let r = hex_const.b2 * x + hex_const.b3 * y;
// 		return new Hex(q, r, true);//TODO round
// 	}
//
// }
//
// function lerp(a, b, t) {
// 	return a * (1 - t) + b * t;
// }