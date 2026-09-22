precision mediump float;

uniform vec2 resolution;
uniform sampler2D bitmap;
uniform sampler2D custom_mask;

uniform float level_min;
uniform float level_max;
uniform float level_black;
uniform float level_white;
uniform bool invert;
uniform bool use_custom_mask;

float remap(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution;
    float mask = smoothstep(level_white, level_black, length(uv-.5));
    if (use_custom_mask)
    {
        vec4 map = texture2D(custom_mask, uv);
        mask = smoothstep(level_black, level_white, (map.r + map.g + map.b) / 3.0);
    }
    mask = remap(mask, 0.0, 1.0, level_min, level_max);
    gl_FragColor = vec4(vec3(mask), 1.0);
}