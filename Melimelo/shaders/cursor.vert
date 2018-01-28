
uniform vec3 mouse;
uniform vec2 resolution;
uniform float cursorState;

varying vec2 vUv;

void main ()
{
	vUv = uv;
	vUv = 1.-vUv;
	vUv.y /= 4.;
	vUv.y += cursorState/4.;
	float aspect = resolution.x/resolution.y;
	vec3 pos = position*.2;
	pos.x /= aspect;
	pos = mouse-pos;
	gl_Position = vec4(pos, 1);
}