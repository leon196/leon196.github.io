class ComposeShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;

				uniform sampler2D leniaTex1;
				uniform sampler2D leniaTex2;
                uniform float time;
                uniform float zoom;
                uniform float secondLayer;
                uniform vec2 offset;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.HASH}

				void main(){
                    vec2 p = pos;
                    p = (p-offset)/zoom;
					vec2 pos2=(p+1.)*.5;
                    outColor = mix(
                        texture(leniaTex1, pos2),
                        texture(leniaTex2, pos2),
                        0.5*(1.-secondLayer));
                    // outColor = texture(leniaTex1, pos2);
				}
			`,
		);
	}
	run(cam,imgSize,canvasSize,zoom,offset,leniaTex1,leniaTex2,settings){
		this.uniforms={
			camZoom:cam.zoom,
			camPos:cam.pos,
			imgSize,
			canvasSize,
			zoom,
			offset,
			time:time/60.,
			leniaTex1:leniaTex1.tex,
			leniaTex2:leniaTex2.tex,
			secondLayer:settings.secondLayer?0:1,
		};
		super.run();
	}
}