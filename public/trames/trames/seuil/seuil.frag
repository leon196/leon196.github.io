#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution;

uniform float r_seuil;
uniform float r_invert;

in vec2 uv;
out vec4 fragColor;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main()
{
    vec3 color = texture(image, uv).rgb;
    float gray = luminance(color);

    // step threshold
    gray = step(r_seuil, gray);

    // invert
    gray = r_invert > 0.5 ? 1.-gray : gray;

	fragColor = vec4(vec3(gray), 1.0);
}