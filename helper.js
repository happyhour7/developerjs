var hbs = require('hbs');

module.exports.registerHelper=function(helper){
	if(helper){
		for(var helperName in helper){
			hbs.registerHelper(helperName, function(num, options){
				return helper[helperName];
		    });
		}
	}
	
}