
uniform vec3 target;
uniform vec2 resolution;
uniform float angle;
uniform float size;

varying vec2 vAnchor;

mat2 rot (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

void main ()
{
	vAnchor = uv*2.-1.;
	float aspect = resolution.x/resolution.y;
	vec3 pos = position*size*2.;
	pos.xy *= rot(angle);
	pos.x /= aspect;
	pos = target-pos;
	// pos *= .1;
	pos.z = .1;
	gl_Position = vec4(pos, 1);
}