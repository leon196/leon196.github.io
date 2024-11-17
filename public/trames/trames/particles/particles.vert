#version 300 es
precision mediump float;

in vec3 position;
in vec2 texcoord;
in vec2 quantity;
out vec2 uv;
out vec2 id;

uniform sampler2D image;
uniform vec2 resolution;
uniform float size, variation_position, variation_rotation, stretch, r_angle, hexagonal;
uniform vec2 grid_dimension;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main()
{
    uv = texcoord * 0.5 + 0.5;
    id = quantity;

    vec2 pos = (position.xy*2.-1.)*2.;
    pos *= rot(r_angle);
    pos += (hash22(vec2(id.y,196.))-.5)*2.*variation_position;

    float gray = 1.-texture(image, pos*.5+.5).r;
    vec2 s = size * gray / grid_dimension;
    vec2 p = texcoord * vec2(1.-stretch, 1);
    p *= rot(variation_rotation*6.283*hash22(vec2(id.y,96.)).x);
    pos += p * s;
    gl_Position = vec4( pos, 0, 1 );
}