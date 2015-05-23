
var logger = require('./mvc-log'),
	fs = require('fs');
var routers={},
	i=0;
module.exports.getRouter=function(router){
	if(router!==null&&typeof router !=='undefined'){
		if(isJson(router)===true)
		{
			return getConfigRouter(router);
		}
	}
}

function getConfigRouter(router){
	var fileContent=null;
	var routers={};
	for(var key in router){
		//判断该项配置是指向配置文件还是指向字符串路由			
		if(isConfigFileORNot(router[key])===true){
			//该项配置指向配置文件
			fileContent=readRouterConfigFile(router[key]);
			for(var tmpKey in fileContent){
				logger.log("发现用户自定义路由：url："+tmpKey+"；实际路由："+fileContent[tmpKey]);
				routers[tmpKey]=fileContent[tmpKey];
			}
		}
		else{
			//配置指向路由
			logger.log("发现用户自定义路由：url："+key+"；实际路由："+router[key]);
			routers[key]=router[key];
		}
	}
	return routers;
}


function isConfigFileORNot(routerPath){
	if(routerPath.indexOf('router-config-')===0){
		return true;
	}
	else
	{
		return false;
	}
}




function readRouterConfigFile(fileName){
	if(fileName.toLowerCase().indexOf('.json')<0){
		fileName+=".json";
	}
	var _routers = JSON.parse(fs.readFileSync('./' + fileName, 'utf-8'));
	return _routers;

}

function isJson(obj){
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" &&
    			 !obj.length;
    return isjson;
}