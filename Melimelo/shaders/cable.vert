
#define e .00001

attribute vec2 indexMap, anchor;
attribute vec3 next, prev;
attribute float path;

uniform float time;
uniform float segments;
uniform vec2 resolution;

varying vec2 vAnchor;
varying float vPath;

void main ()
{
	vAnchor = anchor;
	float aspect = resolution.x/resolution.y;
	float y = anchor.y*.5+.5;
	vPath = path-y/segments;
	vec3 pos = mix(position, next, y);
	// float y = anchor.y;
	// vec3 pos = mix(position, next, max(0., anchor.y));
	// pos = mix(pos, prev, max(0., -anchor.y));
	// vec3 pos = position;
	vec3 forward = normalize(next-position);
	vec3 right = vec3(forward.y, -forward.x, 0);
	right.x /= aspect;
	// right *= 1.+.4*sin(vPath*10.+time);
	float thin = .01;
	pos += right * anchor.x * thin;
	pos += forward * step(-.99, anchor.y) * thin;
	pos -= forward * step(anchor.y, .99) * thin;
	// pos.xy += anchor * .1;
	pos.z = .3+anchor.y*.1;
	gl_Position = vec4(pos, 1);
	// vec2 pivot = anchor;
	// pivot.x /= resolution.x/resolution.y;
	// gl_Position.xy += pivot * .1;
}