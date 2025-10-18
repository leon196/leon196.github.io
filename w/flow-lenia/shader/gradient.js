class GradientShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D affinityTex;
				uniform vec2 size;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);

					float pxy=texelFetch(affinityTex,loopCoord(coord2+ivec2(1,0)),0).x;
					float nxy=texelFetch(affinityTex,loopCoord(coord2+ivec2(-1,0)),0).x;
					float xpy=texelFetch(affinityTex,loopCoord(coord2+ivec2(0,1)),0).x;
					float xny=texelFetch(affinityTex,loopCoord(coord2+ivec2(0,-1)),0).x;
					float pxpy=texelFetch(affinityTex,loopCoord(coord2+ivec2(1,1)),0).x;
					float nxny=texelFetch(affinityTex,loopCoord(coord2+ivec2(-1,-1)),0).x;
					float pxny=texelFetch(affinityTex,loopCoord(coord2+ivec2(1,-1)),0).x;
					float nxpy=texelFetch(affinityTex,loopCoord(coord2+ivec2(-1,1)),0).x;

					float sobelX=(nxny+nxy*2.+nxpy)-(pxny+pxy*2.+pxpy);
					float sobelY=(nxny+xny*2.+pxny)-(nxpy+xpy*2.+pxpy);
					vec2 sobel=vec2(sobelX,sobelY);

					outColor=vec4(sobel.x,sobel.y,0.,0.);

					// outColor=texture(affinityTex,pos2);
				}
			`,
		);
	}
	run(affinityTex,gradientTex){
		this.uniforms={
			affinityTex:affinityTex.tex,
			size:affinityTex.size,
		};
		this.attachments=[
			{
				attachment:gradientTex.tex,
				...sizeObj(gradientTex.size)
			}
		];
		super.run();
	}
}