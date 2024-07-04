
uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 vUv;

uniform float r_lineature, r_angle, r_pattern, hexagonal, stretch, mode;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

void main()
{
	// float gray = texture(image, vUv).r;
  vec2 aspect = vec2(format.x/format.y,1);

  // coordinates
  vec2 p = (vUv-.5)*aspect*rot(r_angle)*r_lineature*format.y/inch_to_mm;
  p.x *= (1.+stretch);
  if (mode > 0.5) p = (p-.5);
  if (hexagonal > 0.5) p.x += floor(mod(p.y,2.))/2.;

  
  vec2 q = p;
  if (mode > 0.5) q = ceil(q);
  q = q/vec2((1.+stretch),1.)*inch_to_mm*rot(-r_angle)/aspect/r_lineature/format.y+.5;

	float gray = texture(image, q).r/2.;
  

  vec2 cell = fract(p)-.5;
  cell.x /= (1.+stretch);

  float trame = 0.;

  // circle
  if (r_pattern == 0.) trame = length(cell)-gray;

  // square
  else if (r_pattern == 1.) trame = max(abs(cell.x), abs(cell.y))-gray;

  // moon
  // else if (r_pattern == 2.)
  // {
  //   trame = -(length(cell)-.5);
  //   cell = fract(p+.2)-.5;
  //   trame = min(trame, length(cell)-gray);
  // }

  // line
  else if (r_pattern == 2.)
  {
    trame = abs(cell.x)-gray;
  }

	gl_FragColor = vec4(step(trame, 0.), 0, 0, 1);
}