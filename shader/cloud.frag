#version 300 es
precision mediump float;

uniform float clic, time, tick;
uniform vec2 resolution, mouse;
uniform sampler2D framebuffer, bluenoise;

in vec2 uv;
out vec4 fragColor;

float gyroid (vec3 p) { return dot(cos(p),sin(p.yzx)); }

float fbm(vec3 p)
{
    float result = 0.;
    float a = .5;
    for (float i = 0.; i < 6.; ++i)
    {
        p.z += result*.2+time*.05;
        result += abs(gyroid(p/a)*a);
        a /= 1.8;
    }
    return result;
}

void main()
{
    vec2 uv = (2.*gl_FragCoord.xy-resolution.xy)/resolution.y;
    vec3 ray = normalize(vec3(uv,.3));
    vec3 blu = texture(bluenoise, gl_FragCoord.xy/1024.).rgb;
    
    vec3 e = vec3(0.2*vec2(resolution.x/resolution.y), 0.);
    // e.xy *= .5+.5*blu.x;
    
    #define T(u) fbm(ray*2.+u)
    float noise = T(0.);
    vec3 normal = normalize(noise-vec3(T(e.xzz),T(e.zyz),1.));
    vec3 tint = 0.5 + 0.5 * cos(vec3(1,2,3)*5. + ray.z * 3. + noise);
    float shade = dot(normal, normalize(vec3(0,1,-1)))*.5+.5;
    vec3 color = vec3(tint * shade);

    fragColor = vec4(color,1.0);
}