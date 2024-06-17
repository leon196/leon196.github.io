
uniform sampler2D image;
uniform vec2 resolution, format;
uniform float rows, columns;
#define R resolution
#define inch_to_mm 25.4
in vec2 vUv;

uniform float r_lineature, r_angle, shape;


void main()
{
	float gray = texture(image, vUv).r;
	vec2 p = vUv*format/inch_to_mm;

	// pattern
	float cos1 = 0.25 * cos((p.x * sin(r_angle) + p.y * cos(r_angle)) * r_lineature);
	float cos2 = 0.25 * cos((p.x * cos(r_angle) - p.y * sin(r_angle)) * r_lineature);
	float trame = cos1 * (1.-max(0., shape)) + cos2 * (1.-max(0., -shape));

	vec3 color = vec3(step(0.5, gray+trame));
	gl_FragColor = vec4(color, 1);
}