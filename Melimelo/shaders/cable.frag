	
uniform float time;
uniform float ratioA;
uniform float ratioB;
varying vec2 vAnchor;
varying float vPath;

void main ()
{
	// float shade = sin((vAnchor.x*.5+.5)*3.14159);
	// shade = 1.;
	float alpha = 1.-abs(vAnchor.x);
	float y = abs(abs((vAnchor.y))-1.)/.1;
	// y = mix(y, 1., smoothstep(1.,2., ratioA+ratioB));
	alpha *= y;
	alpha = smoothstep(.2,.5, alpha);
	// if (shade < .5) { discard; }
	// shade = smoothstep(.0,.5,shade);
	// float t = .5+.5*sin(time);
	// alpha *= .5;
	alpha *= .5+.5*clamp(.5*step(vPath, ratioA)+.5*step(1.-vPath, ratioB), 0., 1.);
	// alpha += (1.-smoothstep(.4,.5,abs(vAnchor.y)))*step(vPath, ratioA)*.02/abs(vAnchor.x);
	gl_FragColor = vec4(alpha);
}