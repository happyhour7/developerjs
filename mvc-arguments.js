exports.dealArguments = function() {
    var arguments = process.argv.splice(2);
    global.logRank = '-dev';
    if(arguments.length===0){
        argumentsCommands['-dev']();
    }else{
        for (var i = 0; i < arguments.length; i++) {
            argumentsCommands[arguments[i]]();
        }
    }
};

var argumentsCommands = {
    '-debug' : function() {
        //开启调式日志
        global.logRank = '-debug';
        console.log('已启用在调试式：开发日志、配置文件自动更新功能开启！');
    },
    '-dev' : function() {
        //默认模式
        global.logRank = '-dev';
        console.log('已启用开发模式：开发日志功能关闭！');
    },
    '-online' : function() {
        //在线模式，不会动态读取配置文件
        global.logRank = '-online';
        console.log('已启用在线模式：开发日志、配置文件自动更新功能关闭！');
    }
};
