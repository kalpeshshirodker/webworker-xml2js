//Using sax.js
//Using assure.js for promise library

var xml2json = (function(){
	var xml2json = {};
	xml2json.converter = function(){
		this.data_array = [];
		this.cdataText = [];
		
		this.promise = new assure();
		
		this.textChar = "#";
		this.attributesChar = "@";
		this.childrenChar = ">"
	}

	var x2jconvproto = xml2json.converter.prototype;
	x2jconvproto.parse = function(xmlstring){
		var me = this;
		var p = this.promise = new assure();
		setTimeout(function() {
			var JSON_Array, JSON_string;
			me.showProgress('Process Start');		
			JSON_Array = me.doParse(xmlstring);
			me.showProgress('Process Complete');
			JSON_string = JSON.stringify(JSON_Array);
			p.resolve({
				eventType : 'resolve',
				status : 'success',
				obj : JSON_string
			});
		}, 1000);
		return p;
	}
	x2jconvproto.doParse = function(xmlstring){
		var me = this;
		var strict = true, // set to false for html-mode
		parser = sax.parser(strict);
		parser.onerror = me.saxOnError.bind(me)
		parser.ontext = me.saxOnText.bind(me);
		parser.onopencdata = me.saxOnOpenCData.bind(me);
		parser.oncdata = me.saxOnCData.bind(me);
		parser.onclosecdata = me.saxOnCloseCData.bind(me);
		parser.onopentag = me.saxOnOpenTag.bind(me);
		parser.onclosetag = me.saxOnCloseTag.bind(me);	
		parser.onend = me.saxOnEnd.bind(me);
		
		parser.write(xmlstring).close();
		
		return this.data_array;
	}

	x2jconvproto.saxOnOpenTag = function(node){
		var children = this.childrenChar;;
		var curNode = {
			name : node.name,		
			isPopulated : false,
			//attributes : []
		};
		curNode[children] = [];
		//add attributes
		if(node.attributes){
			c = curNode[this.attributesChar] = [];
			for(var attr in node.attributes){
				c.push({
					name : attr, value : node.attributes[attr]
				});
			}
		}
		
		var lastNode = this.getLastNode();
		if(lastNode && lastNode[children]){
			lastNode[children].push(curNode);		
		}
		else{
			this.data_array.push(curNode);
		}
	}
	x2jconvproto.saxOnCloseTag = function(node){
		var children = this.childrenChar;
		var c = this.getLastNode();
		if(c){
			delete c.isPopulated;
			var a = this.attributesChar;
			if(c[children] && c[children].length === 0){
				delete c[children];
			}
			if(c[a] && c[a].length === 0){
				delete c[a];
			}
		}
	}
	x2jconvproto.saxOnText = function(text){	
		if(text.trim()){
			var lastNode = this.getLastNode();
			lastNode[this.textChar] = text.trim();
		}
	}
	x2jconvproto.saxOnCData = function(cdata){
		if(cdata && cdata.trim()){
			this.cdataText = [cdata.trim()];
		}
	}
	x2jconvproto.saxOnOpenCData = function(e){
		this.cdataText = null;
		this.cdataText = [];
	}
	x2jconvproto.saxOnCloseCData = function(e){
		if(this.cdataText && this.cdataText.length > 0){
			var lastNode = this.getLastNode();
			lastNode[this.textChar] = this.cdataText.join(' ');
		}
		
		this.cdataText = null;
		this.cdataText = [];
	}
	x2jconvproto.saxOnEnd = function(){
		this.showProgress('Parsing complete.');
	}
	x2jconvproto.saxOnError = function(e){
		this.promise.reject({
			error : e,
			status : 'error'
		});
	}
	x2jconvproto.getLastNode = function(){
		var children = this.childrenChar;
		//get the last node of the array
		var nodeid = this.data_array.length - 1;
		if(nodeid < 0){
			nodeid = 0;
		}
		var prevNode = lastNode = this.data_array[nodeid] || [];
		while(lastNode){
			if(lastNode && lastNode.isPopulated === false){
				childNodes = lastNode[children];
				if(childNodes && childNodes.length > 0){
					prevNode = lastNode;
					lastNode = childNodes[childNodes.length - 1];				
				}
				else{
					break;
				}
			}
			else{
				lastNode = prevNode;
				break;
			}
		}
		return lastNode;
	}
	x2jconvproto.showProgress = function(msg){
		//assure.js doesnt support promise
		/*if(msg){
			this.promise.progress({
				eventType : 'progress',
				status : 'progress',
				obj : msg
			});
		}*/
	}
	return xml2json;
})();
