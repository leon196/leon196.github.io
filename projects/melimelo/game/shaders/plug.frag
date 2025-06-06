
uniform sampler2D sprite;
uniform float ratio;
uniform float alpha;

varying vec2 vAnchor;

void main ()
{
	// float shade = sin(vUv.x*3.14159);
	// gl_FragColor = texture2D(sprite, vUv);
	float dist = length(vAnchor);
	float opacity = .0;
	opacity = 1.-smoothstep(.9,.95,dist);
	opacity *= .5 + .5 * ratio;
	// opacity += (1.-clamp(dist,0.,1.))*ratio*1./dist;
	gl_FragColor = vec4(vec3(1),opacity*alpha);
}