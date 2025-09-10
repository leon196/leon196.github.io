let SHADER_FUNCS={
	DATA_TEX:glsl`
		ivec2 getIdxCoord(int idx,vec2 size){
			int width=int(size.x);
		
			int y=idx/width;
			int x=idx-(y*width);

			if(y<0||y>=int(size.y)){
				return ivec2(-1);
			}
			return ivec2(x,y);
		}
		vec2 getIdxPos(int idx,vec2 size){
			ivec2 coord=getIdxCoord(idx,size);
			if(coord.x==-1){
				return vec2(-1.);
			}
			//sample from center of the pixel
			return (vec2(coord)+.5)/size;
		}
	`,
	HASH:glsl`
		//1 out, 1 in...
		float hash11(float p){
			p = fract(p * .1031);
			p *= p + 33.33;
			p *= p + p;
			return fract(p);
		}
		//  1 out, 2 in...
		float hash12(vec2 p){
			vec3 p3  = fract(vec3(p.xyx) * .1031);
			p3 += dot(p3, p3.yzx + 33.33);
			return fract((p3.x + p3.y) * p3.z);
		}
		//  1 out, 3 in...
		float hash13(vec3 p3){
			p3  = fract(p3 * .1031);
			p3 += dot(p3, p3.zyx + 31.32);
			return fract((p3.x + p3.y) * p3.z);
		}
		// 4 out, 2 in...
		vec4 hash42(vec2 p){
			vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
			p4 += dot(p4, p4.wzxy+33.33);
			return fract((p4.xxyz+p4.yzzw)*p4.zywx);

		}

		// Dave Hoskins
		// https://www.shadertoy.com/view/XdGfRR
		// vec3 hash44(vec4 p)
		// {
		// 	uvec4 q = uvec4(ivec4(p)) * uvec4(1597334673U, 3812015801U, 2798796415U, 1979697957U);
		// 	q = (q.x ^ q.y ^ q.z ^ q.w)*uvec4(1597334673U, 3812015801U, 2798796415U, 1979697957U);
		// 	return vec3(q) * 2.328306437080797e-10;
		// }
		// https://www.shadertoy.com/view/4djSRW
		vec4 hash44(vec4 p4)
		{
			p4 = fract(p4  * vec4(.1031, .1030, .0973, .1099));
			p4 += dot(p4, p4.wzxy+33.33);
			return fract((p4.xxyz+p4.yzzw)*p4.zywx);
		}

		// same hash for coloring label
		// const hash44 = (p4) =>
		// {
		// 	p4[0] = (p4[0] * .1031) % 1;
		// 	p4[1] = (p4[1] * .1030) % 1;
		// 	p4[2] = (p4[2] * .0973) % 1;
		// 	p4[3] = (p4[3] * .1099) % 1;
		// 	let p = new Vector(p4);
		// 	const p2 = new Vector([p4[3]+33.33,p4[2]+33.33,p4[0]+33.33,p4[1]+33.33]);
		// 	const dt = p.dot(p2);
		// 	p[0] += dt;
		// 	p[1] += dt;
		// 	p[2] += dt;
		// 	p[3] += dt;
		// 	p4[0] = ((p[0]+p[1])*p[2])%1;
		// 	p4[1] = ((p[0]+p[2])*p[1])%1;
		// 	p4[2] = ((p[1]+p[2])*p[3])%1;
		// 	p4[3] = ((p[2]+p[3])*p[0])%1;
		// 	return p4;
		// }

	`,
	GAMMA:glsl`
		vec3 gammaCorrect(vec3 col){
			float gammaExp=${1./2.2};
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
		vec3 gammaShift(vec3 col){
			float gammaExp=2.2;
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
	`
};