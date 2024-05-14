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
    float radius = frame.y;
    vec2 pos = frame.zw;
    
    // shape position
    vec2 p = 2.*(uv-pos);//*vec2(resolution.x/resolution.y,1);
    float dist = length(p);

    float shape = smoothstep(.0,.001,dist-size);//-radius*size);

    if (edge > 0.5)
    {
        #define T(u) length(texture(image, uv+u).zw)
        vec2 e = vec2(.001,0);
        shape *= step(abs(T(e.xy)-T(-e.xy))+abs(T(e.yx)-T(-e.yx)), .001);
    }
    
    fragColor = vec4(shape);//vec4(fract(frame.xy), .5, 1);
}