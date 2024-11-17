#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D image, position;
uniform vec2 grid_dimension, resolution;
uniform float tick, last_tick, speed;

void main()
{
    vec3 color = texture(image, uv).rgb;
    
    float shape = smoothstep(.0,.001,color.z-.001);
    color = vec3(1);
    color *= shape;
    // color *= uv.x;

    fragColor = vec4(color, 1);
}