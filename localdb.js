goog.provide('dm.LDB')

goog.require('Lawnchair')

dm.LDB = {
	_lc: null
	,lc:function(){ 
		if(! this._lc)
			this._lc = Lawnchair({name:'dm'},function(){})
		return this._lc
	}
	,save:function(key,v,cb){
		cb = cb || function(){};
		this.lc().save({key:key,'v':v},cb);
	}
	,get:function(key,cb){
		cb = cb || function(){};
		this.lc().get(key,function(o){
			cb(o&&o.v);
		})
	}
	,del:function(key,cb){
		cb = cb || function(){};
		this.lc().remove(key);
	}
}
