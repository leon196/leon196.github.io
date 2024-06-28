
in vec2 vUv;
in vec3 vNormal;

void main()
{
    gl_FragColor = vec4(vec3(vNormal.z), 1);
}