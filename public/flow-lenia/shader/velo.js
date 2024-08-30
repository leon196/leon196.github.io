class VeloShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D gradientTex;
				uniform sampler2D veloTex;
				uniform vec2 size;
				uniform float t;
				uniform float gradientSpeed, velocitySpeed;
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=pos*vec2(.5,.5)+.5;
					ivec2 coord2=ivec2(pos2*size);
					vec2 v=texelFetch(veloTex,coord2,0).xy
						*velocitySpeed
						+texelFetch(gradientTex,coord2,0).xy
						*gradientSpeed;
					v/=max(length(v),1.);
					// v*=0.99;
					outColor=vec4(v,0.,0.);
					// if(t<20.){
					// 	outColor=vec4(.5,.5,0.,0.);
					// }
					// outColor=vec4(0.,0.,0.,0.);
				}
			`,
		);
		this.t=0;
	}
	run(gradientTex,veloTexPP,settings){
		this.uniforms={
			gradientTex:gradientTex.tex,
			veloTex:veloTexPP.tex,
			size:veloTexPP.size,
			t:this.t,
			gradientSpeed:settings.gradientSpeed,
			velocitySpeed:settings.velocitySpeed,
		};
		this.t++;
		this.attachments=[
			{
				attachment:veloTexPP.flip().tex,
				...sizeObj(veloTexPP.size)
			}
		];
		super.run();
	}
}