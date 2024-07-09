#version 300 es
precision mediump float;

uniform sampler2D image;
uniform sampler2D mask;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 uv;
out uint fragColor;

uniform float r_lineature, r_angle, r_pattern, hexagonal, stretch, mode, variation_position, variation_rotation;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
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
  // transformed coordinates
  vec2 aspect = vec2(format.x/format.y,1);
  vec2 p = (uv-.5)*aspect*rot(r_angle)*r_lineature*format.y/inch_to_mm;
  p.x *= (1.+stretch);
  if (hexagonal > 0.5) p.x += floor(mod(p.y,2.))/2.;

  // image coordinates
  vec2 q = p;
  vec2 grid = ceil(q);
  q = grid/vec2((1.+stretch),1.)*inch_to_mm*rot(-r_angle)/aspect/r_lineature/format.y+.5;

  // image sample
	float gray = texture(image, q).r;
  
  // grid
  vec2 cell = fract(p)-.5;
  cell += (hash22(grid)-.5)*variation_position;
  cell *= rot(hash22(grid+196.).x*variation_rotation);
  float crop = step(max(abs(cell.x),abs(cell.y))-.5, 0.);
  
  float trame = texture(mask, cell+.5).r;

  // trame *= crop;

	fragColor = uint(step(trame, gray)*255.*crop);
}