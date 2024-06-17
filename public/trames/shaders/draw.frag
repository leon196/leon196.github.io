in vec2 vUv;

uniform float time;
uniform sampler2D image;

void main()
{
    gl_FragColor = texture(image, vUv);
}
