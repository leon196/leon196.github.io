#version 300 es
precision mediump float;

uniform sampler2D framebuffer, image, lut;
uniform vec2 resolution;
uniform float scale, size, edge, time, tick;

in vec2 uv, view;
out vec4 fragColor;

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
    vec4 frame = texture(image, uv);
    fragColor = frame;
    fragColor = vec4(smoothstep(.01,.0,frame.g-.25));
}