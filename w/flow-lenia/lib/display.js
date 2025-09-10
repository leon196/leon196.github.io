/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

class CoordTransformer{
	constructor(){
	}
	transform(...v){
		return Vec(readArgVec(v));
	}
	transformInv(...v){
		return Vec(readArgVec(v));
	}
	scale(v){
		return v;
	}
	scaleInv(v){
		return v;
	}
}
class Cam extends CoordTransformer{
	constructor(pos,zoom){
		super();
		this.pos=Vec(pos);
		this.zoom=zoom;
	}
	transform(...v){
		return Vec(readArgVec(v)).sub(this.pos).scl(this.zoom);
	}
	transformInv(...v){
		return Vec(readArgVec(v)).scl(1/this.zoom).add(this.pos);
	}
	scale(v){
		return v*this.zoom;
	}
	scaleInv(v){
		return v/this.zoom;
	}
}
class CanvasDisplay{
	constructor(canvas,initResize=true){
		this.canvas=canvas;
		this.ctx=canvas.getContext("2d");

		this.size=null;
		if(initResize){
			window.onresize=()=>this.updateSize();
		}
		this.updateSize();

		this.view=new CoordTransformer();
		// this.view=new Cam(Vec(50,50),.5);

		this.hasStroke=false;
		this.hasFill=false;
		this.resetBrush();
	}

	updateSize(){
		let w=this.canvas.offsetWidth;
		let h=this.canvas.offsetHeight;
		this.size=new Vector(w,h);
		this.canvas.setAttribute("width",w);
		this.canvas.setAttribute("height",h);
	}

	// (x,y)
	transform(...vec){
		return this.view.transform(...vec);
	}
	scale(...vals){
		if(vals.length==1){
			if(typeof vals[0]=="number"){
				return this.view.scale(vals);
			}else{
				vals=[...vals[0]];
			}
		}
		return vals.map(v=>this.view.scale(v));
	}

	setStroke(col){
		this.hasStroke=true;
		this.ctx.strokeStyle=col;
	}
	setFill(col){
		this.hasFill=true;
		this.ctx.fillStyle=col;
	}
	setWeight(val,transform=false){
		if(transform){
			val=this.scale(val);
		}
		this.ctx.lineWidth=val;
	}
	setCap(cap){
		this.ctx.lineCap=cap;
	}
	noStroke(){
		this.hasStroke=false;
		this.ctx.strokeStyle="#FFFFFF00";
	}
	noFill(){
		this.hasFill=false;
		this.ctx.fillStyle="#FFFFFF00";
	}
	resetBrush(){
		this.noStroke();
		this.noFill();
		this.setWeight(1);
		this.setCap("butt");
	}

	line(points,close=false){
		if(points.length==0){
			return;
		}
		points.forEach((p,i)=>i==0?this.mt(p):this.lt(p));
		if(close){
			this.lt(points[0]);
		}
	}
	curve(points,close=false){
		if(points.length==0){
			return;
		}
		function getControlPoint(prev,curr,next,inv=false,tension=.5){
			let diff=next.cln().sub(prev);
			let d1=prev.mag(curr);
			let d2=curr.mag(next);
			let dT=d1+d2;
			if(dT==0.){
				// in this case all 3 points are the same
				return curr.cln();
			}
			return curr.cln().add(
				diff.cln().scl(
					tension*(inv?-d2/dT:d1/dT)
				)
			);
		}
		function getPoint(i){
			return close?
				points[mod(i,points.length)]
				:points[clamp(i,0,points.length-1)];
		}
		
		let leng=points.length;
		if(close){
			leng++;
		}

		this.mt(points[0]);
		for(let i=1;i<leng;i++){
			let prev2=getPoint(i-2);
			let prev=getPoint(i-1);
			let curr=getPoint(i);
			let next=getPoint(i+1);
			this.bt(
				getControlPoint(prev2,prev,curr),
				getControlPoint(prev,curr,next,true),
				curr
			);
		}
	}

	// (x,y)
	mt(...vec){
		let vec2=this.transform(...vec);
		this.ctx.moveTo(vec2[0],vec2[1]);
		return this;
	}
	// (x,y)
	lt(...vec){
		let vec2=this.transform(...vec);
		this.ctx.lineTo(vec2[0],vec2[1]);
		return this;
	}
	// (cx1,cy1) (cx2,cy2) (ex,ey)
	bt(...args){
		let [cx1,cy1]=this.transform(readArgVec(args));
		let [cx2,cy2]=this.transform(readArgVec(args));
		let [ex,ey]=this.transform(readArgVec(args));
		this.ctx.bezierCurveTo(cx1,cy1, cx2,cy2, ex,ey);
	}

	start(){
		this.ctx.beginPath();
		return this;
	}
	path(close=false){
		if(close)
			this.ctx.closePath();
		if(this.hasStroke)
			this.ctx.stroke();
		return this;
	}
	shape(close=false){
		if(close)
			this.ctx.closePath();
		if(this.hasFill)
			this.ctx.fill();
		if(this.hasStroke)
			this.ctx.stroke();
		return this;
	}
	
	// (x,y) (w,h)
	rect(...args){
		let [x,y]=this.transform(readArgVec(args));
		let [w,h]=this.scale(readArgVec(args));
		if(this.hasFill)
			this.ctx.fillRect(x,y,w,h);
		if(this.hasStroke)
			this.ctx.strokeRect(x,y,w,h);
	}
	// (x,y) r
	circ(...args){
		let [x,y]=this.transform(readArgVec(args));
		let r=this.scale(readArg(args));
		this.start();
		this.ctx.arc(x,y,r,0,TAU);
		this.shape(true);
	}

	clear(){
		this.ctx.clearRect(0,0,this.size.x,this.size.y);
	}
	fullRect(){
		if(this.hasFill)
			this.ctx.fillRect(0,0,this.size.x, this.size.y);
	}
}