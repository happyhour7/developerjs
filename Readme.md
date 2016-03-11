## 作用

    将前端开发从MVC框架的各种路由中解脱出来，能坐着就别站着，能躺着就不要坐着。
      * 新建html模板即可实现路由自动映射
      * 通过配置文件实现ajax请求
      * 所有操作无需重启Express

##GITHUB源码地址：
    https://github.com/happyhour7/developerjs
      
##DEMO  
```js
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var developerjs=require("developerjs");
var pjax = require('express-pjax');
var hbs = require('hbs');
var app = express();
var os=require("os");
var task=require("./routes/client");
var test=require("./routes/testcase");

//增加服务端数据返回机制
var controller=require('./routes/server/controller');
controller.setDeveloperjs(developerjs);
controller.init();
////controller文件代码如下/////
//
//var developerJs=null;
//module.exports.setDeveloperjs=function(_dev){
//    developerJs=_dev;
//}
//
//
//module.exports.init=function(){
//    developerJs.addController('home/test',function(){
//        return {
//            text:"这是来自服务端的数据"
//        }
//    });
//}
//
/////////////////////////////
// view engine setup
//developerjs默认支持handlebar模板引擎
app.set('views', path.join(__dirname, 'views'));

app.engine('html', hbs.__express);
app.set('view engine', 'html');
app.use('/api',test);
app.use('/',task);

var arguments = process.argv.splice(2);
if(arguments.length==0)
{
    //自动读取配置文件更新中间件
    app.use(developerjs.ReadConFigFile());
}
else if(arguments[0]=="-online")
{
    developerjs.ReadConFigFile();
}


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


hbs.registerPartials(__dirname + '/views/partials');

app.use((function(){
  return function(req,res,next){
    hbs.registerPartials(__dirname + '/views/partials');
    next();
  }
})());
app.use(express.static(path.join(__dirname, 'admin')));
app.use(pjax());
developerjs.init(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(8080);
module.exports = app;

```



## 安装

  将developerjs安装到本地计算机

```bash
$ npm install -g developerjs
```


##配置文件

```js
{
    "defaultActionName": "index",           
    "layout": {
        "default-layout": "[none]" ,   
        "todolist/index": "[none]",   //不采用模板
        "login/index": "default"     //默认模板       
    },
    "renderOptions":{
        "home": "mvc-config-files/mvc-config-home"   //初始化数据配置文件    
    },

    "ajax": {
        "todolist/getlist": ["这是我的list","这是我的list","这是我的list","这是我的list","这是我的list","这是我的list","这是我的list","这是我的list"],
            "todolist/getlist2": {
            "ajaxRepeat": 3,                                            
            "ajaxData": {"one":"one","two":"two","three":"three"}       
        },
        "haha3": [1,2,3,4,5,6,7,8,9,0],
        "hah4": [1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 32, 1],
        "haha/haha": [1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 32, 1],
        "haha/haha2": [1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 32, 1],
        "login/issuccess":true,
        "login/issuccess2":false,
        "login/issuccess3":false,
        "login/issuccess4":{
            "ajaxRepeat":10,
            "ajaxData":{"one":"one,^_^","two":"two^_^","three":"three^_^"}
        }
    }
}
```

## 更新记录
    2015-3-31 0.0.4版本：实现动态获取已存在的action、ajax，在app.js中只需添加YJS.init(app);
    2015-3-31 0.0.5版本：在前版基础上，添加源代码注释以及格式规范化;
    2015-3-31 0.0.6版本：在前版基础上，简化用户调用代码，具体详见DEMO部分;
    2015-3-31 0.0.7版本：在前版基础上，在配置文件中添加空模板选项;
    2015-3-31 0.0.8版本：在前版基础上，增加了根据环境参数是否启动动态配置文件、日志功能;
    2015-3-31 0.0.9版本：在前版基础上，代码优化;
    2015-3-31 0.1.0版本：在前版基础上，增加404页面优化，并修改了新建ajax转向中的bug;
    2015-3-31 0.1.1版本：在前版基础上，修改了controller自动识别bug;
    2015-3-31 0.1.2版本：在前版基础上，代码优化;
    2015-3-31 0.1.3版本：在前版基础上，新增了partials自动重载;
    2015-4-14 0.1.4版本：在前版基础上，新增了partials自动重载;
    2015-4-14 0.1.5版本：在前版基础上，新增了partials自动重载;
    2015-4-14 0.1.6版本：在前版基础上，删除了partials自动重载;
    2015-4-14 0.1.7版本：在前版基础上，增加mustache模板遍历数据源配置;
    2015-4-14 0.1.8版本：在前版基础上，优化mustache模板数据配置;
    2015-4-15 0.1.9版本：在前版基础上，增加mustache配置独立，使得mustache配置独立为文件形式;
    2015-4-15 0.2.0版本：在前版基础上，使用户不比一定要写文件全名，可以不加后缀;
    2015-4-15 0.2.1版本：在前版基础上，增加模板路径的通用匹配符，在配置模板对应路径的时候可以用'ctroller/*'来匹配某个ctroller下所有action的对应模板;
    2015-4-15 0.2.2版本：在前版基础上，用户配置文件可以放入子文件夹中;

    2015-4-15 1.0.1版本：在前版基础上，追加路由可配置;
    2015-4-15 1.1.5版本：在前版基础上，更新了配置文件说明;
    2015-12-10 1.1.6版本：在前版基础上，更改了文件大小写导致的模块无法加载问题（centos）;
    2015-12-13 1.1.7版本：在前版基础上，增加配置参数通配符*，详见mvc-config.js(用法与普通路径完全一致);
    2015-12-13 1.1.8版本：在前版基础上，解决一个BUG;
    2016-1-23  1.1.9版本：~;
    2016-1-23  1.2.1版本：~；
    2016-1-23  1.2.1版本：更改默认模式为-online模式，降低online模式的实时可配置性，将online模式变为真正在线运行的稳定模式,减少内存泄露；
    2016-2-13 1.2.2版本：在前版基础上，优化全局参数通配符*的处理;
    2016-2-14 1.2.3版本：在前版基础上，解决bug;
    2016-2-15 1.2.4版本：在前版基础上，修复公共配置问价在online模式下不能默认读取的BUG;
    2016-2-18 1.2.5版本:在前版基础上,增加addController方法,提供用户在服务端返回数据的方式;
    2016-2-18 1.2.6版本:在前版基础上,为addController方法增加get参数处理;
## License
    [MIT](LICENSE)
  虽然代码很屎，但违版必究，我说真的，我真的说真的！(LICENSE)
