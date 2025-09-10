/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

class WeakRefSet{
	constructor(){
		//TODO: consider using a weakSet internally along side an array to speed up lookups
		this.array=[];
	}
	
	has(toFind){
		for(let item of this){
			if(item===toFind){
				return true;
			}
		}
		return false;
	}
	add(toAdd){
		if(!this.has(toAdd)){
			this.array.push(new WeakRef(toAdd));
			return true;
		}
		return false;
	}
	delete(toDelete){
		let idx=this.#findIdx(toDelete);
		if(idx!=-1){
			this.array.splice(idx,1);
			return true;
		}
		return false;
	}
	clear(){
		this.array=[];
	}

	forEach(func){
		for(let item of this) {
			func(item);
		}
	}

	#findIdx(toFind){
		let idx=0;
		//the list may shorten while iterating but the idx will always be correct since purged items are not returned by the iterator
		for(let item of this) {
			if(item===toFind){
				return idx;
			}
			idx++;
		}
		return -1;
	}
	*[Symbol.iterator](){
		for(let i=0;i<this.array.length;i++){
			let item=this.array[i].deref();
			if(item===undefined){
				this.array.splice(i,1);
				i--;
			}else{
				yield item;
			}
		}
	}
}
function readArgVec(args,dims=2){
	if(args[0] instanceof Vector){
		let v=args.splice(0,1);
		return [v[0].x,v[0].y];
	}else if(Array.isArray(args[0])){
		let v=args.splice(0,1);
		return v[0];
	}else{
		let v=args.splice(0,dims);
		return v;
	}
}
function readArg(args){
	return args.splice(0,1)[0];
}