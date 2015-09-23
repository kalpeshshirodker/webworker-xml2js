importScripts('../scripts/sax.js');
importScripts('../scripts/assure.js');
importScripts('xml2json-streaming.js');
self.onmessage = function(e){
	var serializedData = e.data;	
	var p, x2jc;
	
	//Sanitize cdata
	serializedData = serializedData.replace(/<!--\[/g, "<![");
	serializedData = serializedData.replace(/\]\]-->/g, "]]>");
	
	x2jc = new xml2json.converter();
	p = x2jc.parse(serializedData);
	
	//TODO:handle progress information
	p.done(function(data){		
		self.postMessage({
			eventType : data.eventType,
			obj : data.obj,
			status : data.status
		});
	});
	p.fail(function(data){
		self.postMessage({
			obj : data.obj,
			status : data.status
		});
	});
}
