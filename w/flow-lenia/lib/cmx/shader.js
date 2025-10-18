/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

function glsl(strings,...keys){
	return strings[0]+keys.map((k,i)=>k+strings[i+1]).join("");
}
function sizeObj(v){
	let arr=[...v];
	return {
		width:arr[0],
		height:arr[1]
	}
}
function boxSize(length,opts,groupLength=1){
	let components=opts?.components??1;
	let arrLeng=length/components;
	let width=opts?.width??(ceil(sqrt(arrLeng)/groupLength)*groupLength);
	let height=ceil(arrLeng/width);//TODO: support enforced opts height
	return [width,height];
}
function boxArray(arr,padding=0,opts,groupLength=1){
	let components=opts?.components??1;
	let size=boxSize(arr.length,opts,groupLength);
	let boxLeng=size[0]*size[1]*components;

	return padArray(arr,boxLeng,padding);
}
function padArray(arr,length,padding=0){
	let arr2=[...arr];
	let padLeng=length-arr2.length;
	arr2.length=length;
	if(padLeng>0){
		arr2.fill(padding,-padLeng);
	}
	return arr2;
}

//TODO: check and use
class ArrayBox{
	constructor(arr,opts){
		this.arr=arr;
		this.opts=opts;
		this.height;
		this.width;
		this.padding=0;
		this.update();
	}
	update(){
		let components=this.opts?.components??1;

		//remove padding
		this.arr.splice(-this.padding);
		//get size
		let size=boxSize(this.arr.length,this.opts);
		this.width=size[0];
		this.height=size[1];
		let requiredLength=this.width*this.height*components;
		
		if(!this.arr instanceof ArrayBuffer){
			let paddingDelta=requiredLength-this.arr.length;
			//TODO: test this
			if(paddingDelta>0){
				for(let i=0;i<paddingDelta;i++){
					this.arr.push(0);
				}
			}else{
				this.arr.splice(paddingDelta);
			}
			this.padding+=paddingDelta;
		}
	}
	get array(){
		return this.arr;
	}
}

//TODO: check and use
class DynamicTypedArray{
	constructor(type,components=1,maxItems=MAX_SHADER_ITEMS){
		this.type=type;
		this.itemBytes=this.type.BYTES_PER_ELEMENT;
		this.components=components;
		this.maxItems=maxItems*this.components;

		this.array=new ArrayBuffer(this.maxItems*this.itemBytes);
		this.view=new this.type(this.array);
		this.length=0;
	}
	hasSpace(count){
		return this.length+count<=this.maxItems;
	}
	push(...items){
		if(!this.hasSpace(items.length)){
			return false;
		}
		this.view.set(items,this.length);
		this.length+=items.length;
		return true;
	}
	reset(){
		this.length=0;
	}
	getTypedArray(){
		return new this.type(this.array,0,this.length);
	}
}

class Texture{
	constructor(opts){
		this.opts=opts;
		this.texture;
		this.create();
	}
	create(){
		this.texture=twgl.createTexture(gl,this.opts);
	}
	update(src){//TODO
		let f;
		if(src instanceof Element){
			f=twgl.setTextureFromElement;
		}else if(src instanceof ArrayBuffer){
			f=twgl.setTextureFromArray;
		}else if(src instanceof ArrayBox){
			f=twgl.setTextureFromArray;
			this.resize(src.width,src.height);
		}else{
			throw Error("update src type is not recognized");
		}
		//TODO: check if src needs to be erased from options 
		return f(gl,this.texture,src,this.opts);
	}
	clear(){
		//TODO: improve
		this.resize();
	}
	resize(width,height){
		if(width){
			this.opts.width=width;
		}
		if(height){
			this.opts.height=height;
		}
		//TODO: look into better resize method
		twgl.resizeTexture(gl,this.texture,this.opts);
	}
	get tex(){
		return this.texture;
	}
	get size(){
		//TODO: check what happnes when no direct size set
		return [this.opts.width,this.opts.height];
	}
	get sizeObj(){
		//TODO: check what happnes when no direct size set
		return {width:this.opts.width,height:this.opts.height};
	}
	get length(){
		return this.opts.width*this.opts.height;
	}
	read(components,format,type,arrayType){
		//TODO: this could be better
		let arr=new arrayType(
			this.opts.width*this.opts.height*components,
		);
		
		let frameBufferInfo=twgl.createFramebufferInfo(gl,[
			{
				attachment:this.tex,
			}
		],this.opts.width,this.opts.height);
		twgl.bindFramebufferInfo(gl,frameBufferInfo);

		gl.readBuffer(gl.COLOR_ATTACHMENT0);
		gl.readPixels(
			0,0,
			this.opts.width,
			this.opts.height,
			format,
			type,
			arr,
		);
		return arr;
	}

	readAt(x,y,format,type,arr)
	{		
		let frameBufferInfo = twgl.createFramebufferInfo(gl,
			[{ attachment:this.tex }],
			this.opts.width,
			this.opts.height);

		twgl.bindFramebufferInfo(gl,frameBufferInfo);

		gl.readBuffer(gl.COLOR_ATTACHMENT0);
		gl.readPixels(x,y,1,1,format,type,arr);
		
		return arr;
	}
}
class TexturePingPong{
	constructor(opts){
		this.opts=opts;
		this.ping=true;
		this.pingTex;
		this.pongTex;
		this.create();
	}
	create(){
		if(Array.isArray(this.opts)){
			this.pingTex=new Texture(this.opts[0]);
			this.pongTex=new Texture(this.opts[1]);
		}else{
			this.pingTex=new Texture(this.opts);
			this.pongTex=new Texture(this.opts);
		}
	}
	forAll(op,args){
		this.pingTex[op](...args);
		this.pongTex[op](...args);
	}
	update(...args){
		this.forAll("update",args);
	}
	clear(...args){
		this.forAll("clear",args);
	}
	resize(...args){
		this.forAll("resize",args);
	}
	flip(){
		this.ping=!this.ping;
		return this;
	}
	get(getCurrent=true){
		return (this.ping==getCurrent)?this.pingTex:this.pongTex;
	}
	get tex(){
		return this.get().tex;
	}
	get size(){
		return this.get().size;
	}
	get sizeObj(){
		return this.get().sizeObj;
	}
	get length(){
		return this.get().length;
	}
	read(...args){
		return this.get().read(...args);
	}
	readAt(...args){
		return this.get().readAt(...args);
	}
}

class Buffer{
	constructor(opts,name="buff"){
		this.opts=opts;
		this.name=name;
		this.buffer;
		this.create();
	}
	create(){
		this.buffer=twgl.createBufferInfoFromArrays(gl,{
			[this.name]:this.opts
		});
	}
	update(src){
		if(this.name=="indices"){
			//TODO: test and allow this to take in any array
			this.setIndicesBufferFromTypedArray(gl,this.buffer[this.name],src);
			this.bufferInfo.numElements=arrays[k].data.length;
		}else{
			twgl.setAttribInfoBufferFromArray(gl,this.buffer.attribs[this.name],src);
		}
	}
	setIndicesBufferFromTypedArray(gl,buffer,array,drawType) {
		const ELEMENT_ARRAY_BUFFER=0x8893;
		const STATIC_DRAW=0x88e4;
		gl.bindBuffer(ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(ELEMENT_ARRAY_BUFFER, array, drawType || STATIC_DRAW);
	}
	get buff(){
		return this.buffer.attribs[this.name];
	}
	read(arrayType){
		//TODO: consider improving
		gl.bindBuffer(gl.ARRAY_BUFFER,this.buff.buffer);

		let bytes=arrayType.BYTES_PER_ELEMENT;
		let leng=gl.getBufferParameter(gl.ARRAY_BUFFER,gl.BUFFER_SIZE)/bytes;
		let arr=new arrayType(leng);
		
		gl.getBufferSubData(
			gl.ARRAY_BUFFER,
			0,
			arr,
		);
		return arr;
	}
}
class BufferPingPong{
	constructor(opts){
		this.opts=opts;
		this.ping=true;
		this.pingBuff;
		this.pongBuff;
		this.create();
	}
	create(){
		if(Array.isArray(this.opts)){
			this.pingBuff=new Buffer(this.opts[0]);
			this.pongBuff=new Buffer(this.opts[1]);
		}else{
			this.pingBuff=new Buffer(this.opts);
			this.pongBuff=new Buffer(this.opts);
		}
	}
	forAll(op,args){
		this.pingBuff[op](...args);
		this.pongBuff[op](...args);
	}
	update(...args){
		this.forAll("update",args);
	}
	flip(){
		this.ping=!this.ping;
		return this;
	}
	get(){
		return this.ping?this.pingBuff:this.pongBuff;
	}
	get buff(){
		return this.get().buff;
	}
	read(...args){
		return this.get().read(...args);
	}
}

class Shader{
	constructor(vs,fs,tsf=null){
		this.uniforms=null;

		//vs
		this.attributes=null;
		this.vs=vs;
		this.tsf=tsf;
		this.transformFeedbackVaryings=null;
		this.drawType=gl.TRIANGLES;

		//fs
		this.fs=fs;
		this.attachments=null;

		this.init();
	}
	init(){
		if(this.tsf==null){
			this.programInfo=twgl.createProgramInfo(gl,[this.vs,this.fs]);
		}else{
			this.programInfo=twgl.createProgramInfo(gl,[this.vs,this.fs],{
				transformFeedbackVaryings: this.tsf
			});
		}
	}
	run(count=undefined,offset=undefined){
		this.uniformsInfo=this.populateInfo(
			(data)=>data,
			this.uniforms,
			this.uniformsInfo
		);

		this.attributesInfo=this.populateInfo(
			(data)=>
				twgl.createBufferInfoFromArrays(gl,data),
			this.attributes,
			this.attributesInfo
		);

		this.transformFeedbackVaryingsInfo=this.populateInfo(
			(data)=>
				twgl.createBufferInfoFromArrays(gl,data),
			this.transformFeedbackVaryings,
			this.transformFeedbackVaryingsInfo
		);
		this.transformFeedbackInfo=this.populateInfo(
			(data)=>
				//TODO: it may be better to reuse transform feedbacks, if it becomes an issue this can be updated
				twgl.createTransformFeedback(gl,this.programInfo,data),
			this.transformFeedbackVaryingsInfo,
			this.transformFeedbackInfo
		);

		this.attachmentsInfo=this.populateInfo(
			(data)=>data,
			this.attachments,
			this.attachmentsInfo
		);
		this.frameBufferInfo=this.populateInfo(
			(data)=>
				//TODO: improve way of getting size, rather than just getting it from the first item
				twgl.createFramebufferInfo(gl,data,data[0].width,data[0].height),
			this.attachmentsInfo,
			this.frameBufferInfo
		);

		//setup
		//program
		gl.useProgram(this.programInfo.program);
		//uniforms
		twgl.setUniforms(this.programInfo,this.uniformsInfo??{});
		//attributes
		twgl.setBuffersAndAttributes(gl,this.programInfo,this.attributesInfo??{});
		//transform feedback
		if(this.transformFeedbackInfo!=null){
			gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbackInfo);
			gl.beginTransformFeedback(this.drawType);
		}
		//frame buffer/attachments
		twgl.bindFramebufferInfo(gl,this.frameBufferInfo);

		// console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER)==gl.FRAMEBUFFER_COMPLETE);
		//draw
		twgl.drawBufferInfo(gl,this.attributesInfo??{},this.drawType,count,offset);

		//cleanup
		//frame buffer/attachements
		twgl.bindFramebufferInfo(gl,null);
		// transform feedback
		if(this.transformFeedbackInfo!=null){
			gl.endTransformFeedback();
			gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		}
		//reset inputs
		this.uniforms=null;
		this.attributes=null;
		this.transformFeedbackVaryings=null;
		this.attachments=null;
	}
	populateInfo(createFunc,data,curr){
		return (data!=null)?createFunc(data):curr;
	}
}

class FragShader extends Shader{
	constructor(fs){
		super(
			glsl`#version 300 es
				in vec4 position;
				out vec2 pos;
				void main(){
					gl_Position=position;
					pos=position.xy;
				}
			`,
			fs
		);
	}
	init(){
		this.attributes={
			position:new Buffer({
				numComponents:2,
				data:[
					-1, 1,
					1, -1,
					1, 1,
					-1, 1,
					1, -1,
					-1, -1,
				]
			}).buff,
		};
		super.init();
	}
}

class ShaderManager{
	constructor(){

	}
	hasSize(){
		return gl.canvas.clientWidth>0&&gl.canvas.clientHeight>0
	}
	resizeToDisplay(...textures){
		if(this.hasSize()){
			let wInit=gl.canvas.width;
			let hInit=gl.canvas.height;
			twgl.resizeCanvasToDisplaySize(gl.canvas,1);
			let w=gl.canvas.width;
			let h=gl.canvas.height;
			if(w!=wInit||h!=hInit){
				textures.forEach(t=>t.resize(w,h));
				return true;
			}
		}
		return false;
	}
}