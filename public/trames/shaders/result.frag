in vec2 vUv;

uniform float time;
uniform sampler2D image;

void main()
{
    gl_FragColor = vec4(vec3(texture(image, vUv).r), 1);
    // gl_FragColor = vec4(vUv, 0, 1);
}
