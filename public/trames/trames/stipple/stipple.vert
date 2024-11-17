#version 300 es
precision mediump float;

in vec3 position;
in vec2 texcoord;
in vec2 quantity;
out vec2 uv;
out vec2 id;

uniform sampler2D image;
uniform vec2 resolution;
uniform float size;
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
    vec2 aspect = vec2(resolution.x/resolution.y, 1);

    vec2 pos = (position.xy*2.-1.);
    vec4 data = texture(image, pos*.5+.5);
    pos = data.xy * 2. - 1.;
    vec2 s = size * data.z / grid_dimension;
    vec2 p = texcoord;
    pos += p * s;
    gl_Position = vec4( pos, 0, 1 );
}