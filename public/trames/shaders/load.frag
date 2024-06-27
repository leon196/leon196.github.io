in vec2 vUv;

uniform float time;
uniform vec2 resolution;

void main()
{
    vec2 p = (vUv-.5) * vec2(resolution.x/resolution.y,1.);
    float shape = smoothstep(.002,.0,abs(length(p)-.02)-.005);

    shape *= smoothstep(.2,.0,abs(fract(atan(p.y,p.x)*10./3.14+time)-.5)-.1);
    gl_FragColor = vec4(vec3(shape), 1.);
}
