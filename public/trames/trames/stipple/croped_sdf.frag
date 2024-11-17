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
    vec3 color = texture(position, uv).rgb;

    if (tick == 0.)
    {
        fragColor = vec4(vec3(1000.), 1);
        return;
    }

    for (float i = 0.; i < 100.; ++i) {
        vec2 p = hash22(vec2(i, tick));
        vec3 d = texture(position, p).xyz;
        float g = texture(image, p).r;
        bool spawn = g < .5;

        spawn = spawn && length(d.xy-p) > .01;
        spawn = length(d.xy-p) > g * .01 + .001;
        spawn = spawn && g < .99;
        if (spawn) {
            float dist = length((p-uv)*vec2(resolution.x/resolution.y,1));
            if (dist < color.z) color.xy = p;
            color.z = min(dist, color.z);
        }
    }
//   {
//     color = texture(position, uv).rgb;
//     float shape = smoothstep(.0,.001,color.z-.001);
//     color = vec3(1);
//     color *= shape;
//     color *= uv.x;
//   }

    fragColor = vec4(color, 1);
}