/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

class Vector extends Array {
	constructor(...data){
		//TODO: Array(10) will create an array of 10 empty items.
		//In the same way Vec(10) will create a 10 dimensional Vector.
		if(data.length==1&&typeof data[0]!="number"){
			super(...data[0]);
		}else{
			super(...data);
		}
	}

	/* UTIL OPS */

	forAll(op,val){
		for(let i=0;i<this.length;i++){
			this[i]=op(this[i],val);
		}
		return this;
	}
	forVec(op,vec){
		let arr=vec;
		let leng=Math.min(this.length,arr.length);
		for(let i=0;i<leng;i++){
			this[i]=op(this[i],arr[i]);
		}
		return this;
	}
	runOp(func,val){
		return typeof val=="number"?
			this.forAll(func,val):
			this.forVec(func,val);
	}

	/* META OPS */

	set(val){
		if(typeof val=="number"){
			this.forAll(()=>val);
		}else{
			let arr=val;
			this.clr();
			this.push(...arr);
		}
		return this;
	}
	clr(){
		this.splice(0,this.length);
		return this;
	}
	cln(){
		return new Vector(this);
	}
	pad(vec){
		let arr=vec;
		for(let i=0;i<arr.length;i++){
			this[i]=this[i]??arr[i];
		}
		return this;
	}
	toString(){
		return this.join(",");
	}

	/* MATH OPS */
	
	add(val){
		return this.runOp((a,b)=>a+b,val);
	}
	sub(val){
		return this.runOp((a,b)=>a-b,val);
	}
	scl(val){
		return this.runOp((a,b)=>a*b,val);
	}
	div(val){
		return this.runOp((a,b)=>a/b,val);
	}

	mod(val=1){
		return this.runOp((a,b)=>((a%b)+b)%b,val);
	}
	mix(val,amount){
		let keep=1-amount;
		return this.runOp((a,b)=>a*keep+b*amount,val);
	}
	
	min(val=0){
		return this.runOp((a,b)=>Math.min(a,b),val);
	}
	max(val=1){
		return this.runOp((a,b)=>Math.max(a,b),val);
	}
	pow(val){
		return this.runOp((a,b)=>Math.pow(a,b),val);
	}
	
	round(){
		return this.forAll(x=>Math.round(x))
	}
	ceil(){
		return this.forAll(x=>Math.ceil(x))
	}
	flr(){
		return this.forAll(x=>Math.floor(x))
	}
	abs(){
		return this.forAll(x=>Math.abs(x))
	}
	sign(){
		return this.forAll(x=>Math.sign(x))
	}
	clamp(min=0,max=1){
		return this.min(max).max(min);
	}

	/* VECTOR OPS */

	within(vec,dist){
		let arr=vec;
		let diff=this.map((x,i)=>x-(arr[i]??x));
		if(diff.some(x=>Math.abs(x)>dist)){
			return false;
		}
		return Math.sqrt(diff.reduce((a,curr)=>a+curr**2,0))<=dist;
	}
	same(vec){
		let arr=vec;
		return this.every((x,i)=>x==(arr[i]??x))
	}

	nrm(val=1){
		let mag=this.mag();
		if(mag==0){
			this[0]=val;
			return this;
		}
		return this.scl(val/mag);
	}
	lim(val=1){
		let mag=this.mag();
		if(mag>val){
			if(mag==0){
				//this is in case the limit is negative
				this[0]=val;
				return this;
			}
			return this.scl(val/mag);
		}
		return this;
	}

	rot(rot,pin){
		if(pin!=null){
			return this.sub(pin).rot(rot).add(pin);
		}else{
			return this.rotXY(rot);
		}
	}
	//TODO: xy,yz,yx, etc etc
	rotXY(rot,pin){
		if(pin!=null){
			return this.sub(pin).rotXY(rot).add(pin);
		}else{
			let mag=this.magXY();
			let ang=this.angXY();
			ang+=rot;
			this[0]=Math.cos(ang)*mag;
			this[1]=Math.sin(ang)*mag;
			return this;
		}
	}

	ang(vec){
		return this.angXY(vec);
	}
	//TODO: xy,yz,yx, etc etc
	angXY(vec){
		if(vec!=null){
			let arr=vec;
			return Math.atan2((arr[1]??0)-(this[1]??0),(arr[0]??0)-(this[0]??0));
		}
		return Math.atan2((this[1]??0),(this[0]??0));
	}

	mag(vec){
		if(vec!=null){
			let arr=vec;
			return Math.sqrt(this.reduce((a,curr,i)=>a+(curr-(arr[i]??0))**2,0));
		}
		return Math.sqrt(this.reduce((a,curr)=>a+curr**2,0));
	}
	//TODO: xy,yz,yx, etc etc
	magXY(vec){
		if(vec!=null){
			let arr=vec;
			return Math.sqrt(((this[0]??0)-(arr[0]??0))**2+((this[1]??0)-(arr[1]??0))**2);
		}
		return Math.sqrt((this[0]??0)**2+(this[1]??0)**2);
	}

	dot(vec){
		let arr=vec;
		return this.reduce((a,curr,i)=>a+curr*(arr[i]??0),0);
	}
	cross(vec){//TODO
		return [
			this.y*vec.z-this.z*vec.y,
			this.z*vec.x-this.x*vec.z,
			this.x*vec.y-this.y*vec.x,
		];
	}

	/* GETTERS & SETTERS */

	get length(){
		return this.length;
	}

	get x(){
		return this[0]??0;
	}
	get y(){
		return this[1]??0;
	}
	get z(){
		return this[2]??0;
	}
	get w(){
		return this[3]??0;
	}

	set x(val){
		return this[0]=val;
	}
	set y(val){
		return this[1]=val;
	}
	set z(val){
		return this[2]=val;
	}
	set w(val){
		return this[3]=val;
	}
}
{
	let refs=["x","y","z","w"];
	let swizzles={};
	function buildKey(key,count){
		if(count==0){
			let ids=key.split("").map(x=>refs.indexOf(x));
			swizzles[key]={
				get:function(){
					return ids.map((i)=>this[i]??0);
				},
				set:function(val){
					if(typeof val=="number"){
						ids.forEach((i)=>this[i]=val);
					}else{
						let arr=val;
						ids.forEach((i,j)=>this[i]=arr[j]??0);
					}
				}
			};
			return;
		}
		refs.forEach(r=>{
			buildKey(key+r,count-1);
		});
	}
	buildKey("",2);
	buildKey("",3);
	buildKey("",4);
	Object.defineProperties(Vector.prototype,swizzles);
}

function Vec(...data){
	return new Vector(...data);
}
function VecA(mag,...angs){
	let v=new Vector(mag,0);
	if(angs[0]!=null)
		v.rot(angs[0]);
	if(angs[1]!=null)
		v.xz=new Vector(v.xz).rot(angs[1]);
	if(angs[2]!=null)
		v.yz=new Vector(v.yz).rot(angs[2]);
	return v;
}
