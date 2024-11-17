#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D image, position;
uniform vec2 grid_dimension, resolution;
uniform float tick, last_tick, speed;

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
    float rng = hash22(gl_FragCoord.xy).x;
    vec2 aspect = vec2(resolution.x/resolution.y, 1);

    if (tick == 0.)
    {
        vec2 pos = uv + (hash22(gl_FragCoord.xy)-.5)/50. / aspect;
        pos.xy = clamp(pos.xy, vec2(0), vec2(1));
        float gray = 1.-texture(image, pos).r;
        gray = step(rng, gray);
        fragColor = vec4(pos, gray, 1);
    }
    // else if (tick < last_tick)
    else
    {
        vec4 data = texture(position, uv);
        fragColor = data;

    }
}