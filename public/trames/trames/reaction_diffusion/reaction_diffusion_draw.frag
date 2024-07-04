
uniform sampler2D image;
in vec2 vUv;

void main()
{
    vec4 frame = texture(image, vUv);
    gl_FragColor = vec4(smoothstep(.01,.0,frame.g-.2));
    // gl_FragColor = frame;
}