(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	Imba.defineTag('el', function(tag){
		
		tag.prototype.flag = function (ref){
			this._flagged = ref;
			return tag.__super__.flag.apply(this,arguments);
		};
	});
	
	Imba.defineTag('group', function(tag){
		
		tag.prototype.__ops = {name: 'ops'};
		tag.prototype.ops = function(v){ return this._ops; }
		tag.prototype.setOps = function(v){ this._ops = v; return this; };
		
		tag.prototype.__opstr = {name: 'opstr'};
		tag.prototype.opstr = function(v){ return this._opstr; }
		tag.prototype.setOpstr = function(v){ this._opstr = v; return this; };
		
		
		tag.prototype.__expected = {name: 'expected'};
		tag.prototype.expected = function(v){ return this._expected; }
		tag.prototype.setExpected = function(v){ this._expected = v; return this; };
		
		tag.prototype.__actual = {name: 'actual'};
		tag.prototype.actual = function(v){ return this._actual; }
		tag.prototype.setActual = function(v){ this._actual = v; return this; };
		
		tag.prototype.setStaticChildren = function (nodes){
			this._ops = [];
			this._opstr = "";
			this.setExpected(_.flatten(nodes).filter(function(n) {
				return n && n._dom;
			}));
			this.setActual([]);
			this.log("setStaticChildren",nodes,this.expected());
			tag.__super__.setStaticChildren.call(this,nodes);
			
			for (var i=0, ary=iter$(this._dom.childNodes), len=ary.length, child; i < len; i++) {
				child = ary[i];
				var el = tag$wrap(child);
				if (el != this.expected()[i]) {
					this.log("not the same as expected at i",child,this.expected()[i]._dom);
				};
				this.actual().push(tag$wrap(child));
			};
			
			this.log(this.actual());
			eq(this.actual(),this.expected());
			this.log("is the same, no?!?");
			return this;
		};
		
		tag.prototype.appendChild = function (node){
			this.log("appendChild",node);
			this.ops().push(["appendChild",node]);
			this._opstr += "A";
			return tag.__super__.appendChild.apply(this,arguments);
		};
		
		tag.prototype.removeChild = function (node){
			this.log("removeChild",node);
			this.ops().push(["removeChild",node]);
			this._opstr += "R";
			return tag.__super__.removeChild.apply(this,arguments);
		};
		
		tag.prototype.insertBefore = function (node,rel){
			this.log("insertBefore");
			this.ops().push(["insertBefore",node,rel]);
			this._opstr += "I";
			return tag.__super__.insertBefore.apply(this,arguments);
		};
		
		tag.prototype.reset = function (){
			return this.render();
		};
		
		tag.prototype.render = function (pars){
			// no need for nested stuff here - we're testing setStaticChildren
			// if it works on the flat level it should work everywhere
			if(!pars||pars.constructor !== Object) pars = {};
			var a = pars.a !== undefined ? pars.a : false;
			var b = pars.b !== undefined ? pars.b : false;
			var c = pars.c !== undefined ? pars.c : false;
			var d = pars.d !== undefined ? pars.d : false;
			var e = pars.e !== undefined ? pars.e : false;
			var list = pars.list !== undefined ? pars.list : null;
			return this.setStaticChildren([
				(this[0] = this[0] || t$('el')).flag('a').setText("top").end(),
				(this[1] = this[1] || t$('el')).flag('b').setText("ok").end(),
				(a) && ([
					3,(this[2] = this[2] || t$('el')).flag('header').end(),
					(this[3] = this[3] || t$('el')).flag('title').setText("Header").end(),
					(this[4] = this[4] || t$('el')).flag('tools').end(),
					b ? ([
						1,(this[5] = this[5] || t$('el')).flag('long').end(),
						(this[6] = this[6] || t$('el')).flag('long').end()
					]) : ([
						2,(this[7] = this[7] || t$('el')).flag('short').end()
					]),
					(this[8] = this[8] || t$('el')).flag('ruler').end()
				]),
				(c) && ([
					4,(this[9] = this[9] || t$('div')).flag('c1').setText("long").end(),
					(this[10] = this[10] || t$('div')).flag('c2').setText("loong").end()
				]),
				d && e ? ([
					5,(this[11] = this[11] || t$('el')).flag('long').end(),
					(this[12] = this[12] || t$('el')).flag('footer').end(),
					(this[13] = this[13] || t$('el')).flag('bottom').end()
				]) : (e ? ([
					6,(this[14] = this[14] || t$('el')).flag('footer').end(),
					(this[15] = this[15] || t$('el')).flag('bottom').end()
				]) : ([
					7,(this[16] = this[16] || t$('el')).setText("!d and !e").end()
				])),
				list,
				(this[17] = this[17] || t$('el')).flag('x').setText("very last").end()
			]).synced();
		};
	});
	
	
	describe("Tags",function() {
		
		var a = t$('el').flag('a').setText("a").end();
		var b = t$('el').flag('b').setText("b").end();
		var c = t$('el').flag('c').setText("c").end();
		var d = t$('el').flag('d').setText("d").end();
		var e = t$('el').flag('e').setText("e").end();
		var f = t$('el').flag('f').setText("f").end();
		var g = t$('el').flag('g').setText("g").end();
		var h = t$('el').flag('h').setText("h").end();
		
		var group = t$('group').end();
		document.body.appendChild(group.dom());
		
		test("first render",function() {
			group.render();
			return eq(group.opstr(),"AAAA");
		});
		
		test("second render",function() {
			// nothing should happen on second render
			group.render();
			return eq(group.opstr(),"");
		});
		
		test("added block",function() {
			group.render({c: true});
			return eq(group.opstr(),"II");
		});
		
		test("remove again",function() {
			group.render({c: false});
			return eq(group.opstr(),"RR");
		});
		
		return describe("dynamic lists",function() {
			// render once without anything to reset
			
			test("adding dynamic list items",function() {
				group.render({list: [a,b,c,d]});
				return eq(group.opstr(),"IIII");
			});
			
			return test("should be reorderable",function() {
				group.render({list: [b,a,c,d]});
				eq(group.opstr(),"I");
				return console.log(group.opstr());
			});
		});
	});

})()