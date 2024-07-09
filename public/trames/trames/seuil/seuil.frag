#version 300 es
precision mediump float;

in vec2 uv;
out uint fragColor;

uniform sampler2D image;
uniform float r_seuil, r_invert;

void main()
{
    float gray = texture(image, uv).r;
    // float gray = float(texture(image, uv).r)/255.;

    // step threshold
    gray = step(r_seuil, gray);

    // invert
    gray = r_invert > 0.5 ? 1.-gray : gray;

	// fragColor = vec4(vec3(gray), 1.0);
    fragColor = uint(gray*255.);
}