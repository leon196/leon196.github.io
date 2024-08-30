class ViscosityShader extends FragShader{
	constructor(kSize=10){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D leniaTex;
				uniform sampler2D veloTex;
				uniform vec2 size;
				in vec2 pos;
				out vec4 outColor;

				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);
					
					float weight=texelFetch(leniaTex,coord2,0).r;
					vec2 velo=texelFetch(veloTex,coord2,0).rg*weight;
					vec2 veloTotal;
					float weightTotal;
					int kSize=${kSize};
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								ivec2 coordOff=loopCoord(coord2+offset);
								float w=texelFetch(leniaTex,coordOff,0).r;
								weightTotal+=w;
								veloTotal+=texelFetch(veloTex,coordOff,0).rg*w;
							}
						}
					}
					
					// weightTotal*=0.;
					// veloTotal*=0.;
					weightTotal+=weight;
					veloTotal+=velo;
					if(weightTotal>0.){
						veloTotal/=weightTotal;
					}

					outColor=vec4(veloTotal,0.,0.);
				}
			`,
		);
	}
	run(leniaTex,veloTexPP){
		this.uniforms={
			leniaTex:leniaTex.tex,
			veloTex:veloTexPP.tex,
			size:leniaTex.size,
		};
		this.attachments=[
			{
				attachment:veloTexPP.flip().tex,
				...sizeObj(veloTexPP.size)
			}
		];
		super.run();
	}
}