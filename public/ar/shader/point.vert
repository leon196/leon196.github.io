
uniform sampler2D video;
uniform sampler2D xy_lut;
out vec2 vUv;
out vec3 vNormal;

const vec2 range = vec2(0.38, 1.12);
const vec2 resolution = vec2(640.,576.);

#define T(e) getPos(texture(video, vUv+e).rgb, vUv+e)

// Sam Hocevar
vec3 rgb2hsv(vec3 c)
{
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec2 sign2(vec2 p)
{
	return vec2(p.x <= 0. ? -1. : 1., p.y <= 0. ? -1. : 1.);
}

vec3 getPos(vec3 rgbd, vec2 uv)
{
    float z = range.x+rgb2hsv(rgbd).x*range.y;
    vec2 xy = texture(xy_lut, uv).xy*sign2(uv-vec2(.5,.405));
	// vec2 xy = uv-.5;
    return vec3(xy*z, -z+1.);
}

void main()
{
    vUv = position.xy;
    vec3 rgb = texture(video, vUv).rgb;
    vec3 pos = getPos(rgb, vUv);
    float lum = rgb.r+rgb.g+rgb.b;

    vec3 e = vec3(2./resolution, 0.);
    vNormal = (cross(normalize(T(e.xz)-T(-e.xz)+.001), normalize(T(e.zx)-T(-e.zx)+.001)));
    gl_PointSize = step(.01, lum) * 8.;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1);
}