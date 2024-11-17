#version 300 es
precision mediump float;

uniform sampler2D image, feedback, particles;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4

in vec2 uv;
out vec4 fragColor;

uniform float r_lineature, time, tick, threshold, fixed_size;

#define N(v) (length(v) > 0. ? normalize(v) : vec3(0))
// #define T(u) noise(vec3(q+u,time*.1))
// #define P(u) vec3(q+u, T(u))
#define T(u) texture(particles, q + u).r
#define P(u) vec3(q+u, T(u))
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 4.; ++i, a/=2.)
    {
        result += ((gyroid(p/a)))*a;
    }
    return result;
}

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main()
{
  if (tick < 2.)
  {
    vec2 pos = uv*2.-1.;
    float size = 1.-texture(image, uv).r;
    if (fixed_size > .5) {
      size = step(threshold, size);
    }
    fragColor = vec4(pos, size, 1);
  }
  else
  {
    vec4 data = texture(feedback, uv);
    vec2 aspect = vec2(resolution.x/resolution.y, 1);
    vec2 pos = data.xy;
    vec3 e = vec3(1./R,0);
    vec2 q = pos * 0.5 + 0.5;
    // vec3 z = P(0.);
    vec4 particle = texture(particles, q);
    vec3 normal = N(vec3(cross(N(P(e.xz)-P(-e.xz)), N(P(e.zy)-P(-e.zy)))));
    // pos += vec2(normal.y, -normal.x) * 1. / R * (1.-data.z);
    // pos += N(vec2(normal.y, -normal.x)) * z.z / R;// * (1.-data.z);
    // float same
    // pos += 1. * N(vec3(normal.xy,0)).xy / R;// * (1.-data.z);
    pos += 1. * normal.xy / R;// * (1.-data.z);
    float size = 1.-texture(image, pos * .5 + .5).r;
    if (fixed_size > .5) {
      size = step(threshold, size);
    }
    
    fragColor = vec4(pos, size, 1);
  }
}