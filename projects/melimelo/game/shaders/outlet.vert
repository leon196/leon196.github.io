
uniform float size;
uniform vec2 resolution;
uniform vec3 target;

varying vec2 vUv;

void main () {

	vUv = uv;

	float aspect = resolution.x/resolution.y;
	vec3 pos = position*size*2.;
	pos.x /= aspect;
	pos = target-pos;
	pos.z = .5;
	gl_Position = vec4(pos, 1);

}