
uniform sampler2D cursorTexture;

varying vec2 vUv;

void main ()
{
	gl_FragColor = texture2D(cursorTexture, vUv);
}