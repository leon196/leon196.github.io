	
uniform float time;
uniform float ratioA;
uniform float ratioB;
uniform float alpha;
varying vec2 vAnchor;
varying float vPath;

void main ()
{
	// float shade = sin((vAnchor.x*.5+.5)*3.14159);
	// shade = 1.;
	// float alpha = 1.-abs(vAnchor.x);
	float cable = .5/abs(vAnchor.x);
	float y = abs(abs((vAnchor.y))-1.)/.1;
	cable = smoothstep(.2, 1., cable);
	cable *= clamp(y*(1.-abs(vAnchor.x)), 0., 1.);
	// y = mix(y, 1., smoothstep(1.,2., ratioA+ratioB));
	// cable = smoothstep(.2,.5, cable);
	// if (shade < .5) { discard; }
	// shade = smoothstep(.0,.5,shade);
	// float t = .5+.5*sin(time);
	// cable *= .5;
	cable *= .5+.5*clamp(.5*step(vPath, ratioA)+.5*step(1.-vPath, ratioB), 0., 1.);
	// cable += (1.-smoothstep(.4,.5,abs(vAnchor.y)))*step(vPath, ratioA)*.02/abs(vAnchor.x);
	gl_FragColor = vec4(cable*alpha);
}