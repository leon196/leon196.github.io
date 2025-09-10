class ComposeShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;

				uniform sampler2D leniaTex;
                uniform float time;
                uniform float zoom;
                uniform vec2 offset;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.HASH}

				void main(){
                    vec2 p = pos;
                    p = (p-offset*zoom)/zoom;
					vec2 uv=(p+1.)*.5;
					outColor = texture(leniaTex, uv);
				}
			`,
		);
	}
	run(cam, imgSize, canvasSize){
		this.uniforms={
			camZoom:cam.zoom,
			camPos:cam.pos,
			imgSize,
			canvasSize,
			zoom,
			offset,
			time,
			leniaTex: lenia.renderTex,
		};
		super.run();
	}
}