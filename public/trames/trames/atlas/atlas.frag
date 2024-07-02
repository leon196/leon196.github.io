
uniform sampler2D image;
uniform sampler2D alphabet, numbers, symbols;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 vUv;

uniform float r_lineature, grid, scale, pattern;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

void main()
{
  vec2 aspect = vec2(format.x/format.y,1);

  // coordinates
  vec2 p = (vUv-.5)*aspect*r_lineature*format.y/inch_to_mm;
  vec2 q = floor(p)*inch_to_mm/aspect/r_lineature/format.y+.5;
	float gray = texture(image, q).r;

  float i = floor(gray * grid * grid);
  p = ((fract(p)-.5)/scale)+.5 + vec2(mod(i, grid), floor(i / grid));
  p /= grid;
  p = abs(fract(p));
  
  float trame = 0.;
  if (pattern == 0.) trame = texture(alphabet, p).a;
  else if (pattern == 1.) trame = texture(numbers, p).a;
  else if (pattern == 2.) trame = texture(symbols, p).a;

	gl_FragColor = vec4(step(0.5, trame), 0, 0, 1);
}