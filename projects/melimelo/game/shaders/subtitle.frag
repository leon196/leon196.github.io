
uniform sampler2D subtitle;

varying vec2 vUv;

void main ()
{
	gl_FragColor = texture2D(subtitle, vUv);
}