
uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 vUv;

uniform float r_lineature, total_steps, threshold, thickness;

void main()
{
  vec2 aspect = vec2(format.x/format.y,1);

  vec2 dim = aspect*r_lineature*format.y/inch_to_mm;

  // coordinates
  vec2 p = (vUv-.5)*dim;
  float lod = 1.;
  float gray = 1.;

  for (float steps = 0.; steps < total_steps; ++steps)
  {
    lod = pow(2., steps);
    vec2 q = floor(p/lod)*lod/dim+.5;

    gray = texture(image, q).r;
    if (gray > threshold) break;
  }
  float trame = 0.;

  p = .5-abs(fract(p/lod)-.5);
  trame = step(min(p.x,p.y), thickness/lod);
  // trame = fract(p.x);

	gl_FragColor = vec4(trame, 0, 0, 1);
}