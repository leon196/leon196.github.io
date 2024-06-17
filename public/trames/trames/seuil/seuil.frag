
uniform sampler2D image;
uniform float r_seuil, r_invert;

in vec2 vUv;

void main()
{
    vec2 coord = vUv;
    float gray = texture(image, coord).r;

    // step threshold
    gray = step(r_seuil, gray);

    // invert
    gray = r_invert > 0.5 ? 1.-gray : gray;

	gl_FragColor = vec4(vec3(gray), 1.0);
}