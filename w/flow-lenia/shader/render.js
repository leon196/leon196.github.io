class RenderShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;

				uniform sampler2D leniaTex1;
				uniform sampler2D imageTex;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2 = (pos+1.)*.5;
					pos2 = vec2(pos2.x,1.-pos2.y);
					vec4 lenia1 = texture(leniaTex1,pos2);
					outColor = vec4(vec3(atan(lenia1.x)),1.);
					// outColor = mix(outColor, texture(imageTex, pos2), 0.1);
				}
			`,
		);
	}
	run(leniaMaterials,renderTex,imageTex){
		this.uniforms={
			leniaTex1: leniaMaterials[0].leniaTexPP.tex,
			imageTex: imageTex.tex,
		};
		this.attachments=[
			{
				attachment:renderTex.tex,
				...sizeObj(renderTex.size)
			}
		];
		super.run();
	}
}