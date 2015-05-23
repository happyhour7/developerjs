/**
 * 文件功能描述           :YJS
 * 使用方法                 :直接use
 * author       :wei.wang@yoho.cn
 * date         :2015-3-27
 */
var logger = require('./mvc-log'),
    fs = require('fs'),
    argus = require('./mvc-arguments'),
    config = {},
    configFileCurrentModifyTime = '',
    hbs = require('hbs'),
    helper = require('./helper'),
    dRouter = require('./router');

readConfig();
argus.dealArguments();

/**
 * 函数功能描述           :扫描给定路径下的所有文件夹
 * @param       :path  指定路径
 * @returns     :{folders:[]}
 */
function scanFolder(path) {
    var folderList = [],
        walk = function(path, folderList) {
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                if (stats.isDirectory()) {
                    walk(tmpPath, folderList);
                    folderList.push(tmpPath);
                }
            });
        };
    walk(path, folderList);
    return {
        'folders': folderList
    }
}

/**
 * 函数功能描述           :扫描给定路径下的所有文件
 * @param       :path  指定路径
 * @returns     :{files:[]}
 */
function scanViews(path) {
    var fileList = [],
        walk = function(path) {
            files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = path + '/' + item,
                    stats = fs.statSync(tmpPath);
                if (!stats.isDirectory()) {
                    fileList.push(tmpPath);
                }
            });
        };
    walk(path);
    return {
        'files': fileList
    };
}

/**
 * 函数功能描述           :获取数组的最后一个元素
 * @param       :arrayObject  数组
 * @returns     :数组最后 一个元素
 */
function getArrayLast(arrayObject) {
    return arrayObject[arrayObject.length - 1];
}

/**
 * 函数功能描述           :获取某个路径对应的模板文件
 * @param       :actionPath  action访问路径
 * @returns     :模板名称
 */
function getLayout(actionPath) {
    var model = config.layout[actionPath];
    var controllerName = actionPath.indexOf('/') > 0 ? actionPath.split('/')[0] : actionPath;
    if (typeof model === 'undefined' || model == null) {
        model = config.layout[controllerName + '/*'] || config.layout["default-layout"];
    }

    if (model === '[none]') {
        return false;
    } else {
        return 'layout/' + model;
    }
}

/**
 * 函数功能描述           :从配置文件中获取所有的ajax配置
 * @param       :app    express对象
 * @param       :url    用户访问的url
 * @param       :_res   当前请求的response对象
 * @returns     :若初始化新增ajax成功返回true，其余返回false
 */
function loadAjax(app, url, _res) {
    var ajaxData = null,
        actionPath = null;
    //ajax路由返回
    if (typeof(config.ajax) !== 'undefined') {
        if (typeof url !== 'undefined') {
            //用户访问了一个未注册的url，查找该url是否是一个刚刚加入到配置文件中的ajax请求
            if (typeof(config.ajax[url]) !== 'undefined' && config.ajax[url] !== null) {
                _res.send(getAjaxData(url));
                logger.log("[-->register ajax<--]\r\n    注册ajax路由:" + url, 'ajax');
                setActionRouter(app, '/' + url, getAjaxData(url), true);
                return true;
                //这是一个用户刚刚添加的ajax请求
            }
        } else {
            //初始化所有ajax请求
            for (actionPath in config.ajax) {
                (function(actionPath) {
                    logger.log("[-->register ajax<--]\r\n    注册ajax路由:" + actionPath, 'ajax');
                    setActionRouter(app, '/' + actionPath, getAjaxData(actionPath), true);
                })(actionPath);
            }
        }
        return false;

    }
}

/**
 * 函数功能描述           :从mvc-config中读取配置文件
 * @param       : 如果没有就读取默认的mvc-config.json，否则读取指定文件
 * @returns     :用户配置的返回数据
 */
function readConfig() {
    var configFileName = arguments[0] || 'mvc-config.json';
    if (configFileName === 'mvc-config.json') {
        logger.warn("[-->init config<--]\r\n    初始化配置文件mvc-config.json配置文件");
    } else {
        logger.warn("[-->init config<--]\r\n    读取用户自定义配置文件：" + configFileName);
    }
    var _config = JSON.parse(fs.readFileSync('./' + configFileName, 'utf-8'));
    if (arguments.length > 0) {
        return _config;
    } else {
        config = _config;
        return true;
    }
}

/**
 * 函数功能描述           :判断文件是否改变过（该函数留作后期优化使用，暂未实现）
 * @param       : 配置文件名称
 * @returns     :如果文件已经更改返回true，否则返回false
 */
/*function isFileChanged(fileName){

}*/

/**
 * 函数功能描述           :从ajax将配置中获取用户配置的返回数据
 * @param       :actionPath    访问路径
 * @returns     :用户配置的返回数据
 */
function getAjaxData(actionPath) {
    var returnData = null;
    //首先判断用户是否设置了数据重复N次
    if (typeof(config.ajax[actionPath].ajaxRepeat) != "undefined" && config.ajax[actionPath].ajaxRepeat > 1) {
        returnData = [];
        for (var i = 0; i < config.ajax[actionPath].ajaxRepeat; i++) {
            returnData.push(config.ajax[actionPath].ajaxData);
        }
    } else {
        returnData = config.ajax[actionPath].ajaxData || config.ajax[actionPath];
    }
    return returnData;
}

/**
 * 函数功能描述           :将一个虚拟路由注册为express mvc路由
 * @param       :app    express对象
 * @param       :url    用户访问的url
 * @param       :path   action路径
 * @param       :isAjax 是否是ajax请求
 * @returns     :用户配置的返回数据
 */
function setActionRouter(app, url, path, isAjax) {
    var urlKey = url.substring(1),
        options = {},
        routers = {},
        userUrl = url;
    routers = getUserRouter();
    console.log(urlKey);
    if (typeof routers!=='undefined'&&routers!=null&&typeof routers[url] !== 'undefined' && routers[url] !== null) {
        userUrl = routers[url];
    }
    app.get(userUrl, function(req, res, next) {
        if (req.header('X-PJAX')) {
            logger.log("[-->go url<--]\r\n    转到Pjax路由:" + path, 'pjax');
        } else if (isAjax !== true) {
            logger.log("[-->go url<--]\r\n "+"url路径："+userUrl+"    转到页面路由：" + path, 'page');
        } else {
            logger.log("[-->go url<--]\r\n    转到ajax路由:" + path, 'ajax');
        }
        if (isAjax !== true) {

            logger.log("模板路径：" + getLayout(urlKey) + "           路径：" + urlKey);
            options = dealOptions({
                layout: getLayout(urlKey)
            }, getUserOptions(config.renderOptions[urlKey]));
            res.renderPjax(path, options);
        } else {
            res.send(getAjaxData(urlKey));
        }
    });
}

/**
 * 函数功能描述           :初始化整个YJS
 * @param       :app    express对象
 * @returns     :无
 */
module.exports.init = function(app) {
    var rootDic = process.cwd() + "/views/actions/",
        controllers = scanFolder(rootDic).folders,
        actionNames = [],
        actionName = '',
        actionPath = '';
    if (controllers.length === 0) {
        //用户没有设置任何controller
        setActionRouter(app, '/', 'errordefault');
    } else {
        //注册默认路由
        setActionRouter(app, '/', 'index');
        //为所有view中的模板注册controller路由
        for (var i = 0; i < controllers.length; i++) {
            //利用闭包循环注册所有controll与action的对应关系
            (function(currentController) {
                var controllerName = getArrayLast(currentController.split('/')),
                    defaultAction = 'actions/' + controllerName + '/' + config.defaultActionName,
                    configKeyActionPath = controllerName + '/' + config.defaultActionName;
                logger.log("[-->register url<--]\r\n    注册路由:" + defaultAction);
                setActionRouter(app, '/' + controllerName, defaultAction);
                actionNames = scanViews(currentController.replace('/\/ig', '\\')).files;
                for (var j = 0; j < actionNames.length; j++) {
                    //注册非默认action路由
                    (function(tmpActionNames) {
                        var actionPath = '',
                            actionName = '';
                        actionName = getArrayLast(tmpActionNames.split('/')).split('.')[0];
                        if (actionName === config.defaultActionName) {
                            return;
                        }
                        logger.log("[-->register url<--]\r\n    注册路由:" + defaultAction);
                        actionPath = controllerName + '/' + actionName;
                        setActionRouter(app, '/' + actionPath, 'actions/' + actionPath);
                    })(actionNames[j]);

                }
            })(controllers[i]);
        }

    }
    //初始化配置文件中的ajax请求
    loadAjax(app);
    //处理404页面
    app.get('*', function(req, res) {
        exports.addAction(app, req.originalUrl, res);
    });
};
/**
 * 函数功能描述           :判断一个html模板是否存在的回调函数
 * @param       :isexitst       文件是否存在，true、false
 * @param       :app            express对象
 * @param       :newFilePath    所判断的文件
 * @param       :url            文件对应的url地址
 * @param       :_res           当前请求的response对象
 * @returns     :无
 */
function isExists(isexitst, app, newFilePath, url, _res) {
    var urlKey = url.substring(1),
        options = null;
    if (isexitst === true) {
        logger.log("[-->add action<--]\r\n    action视图文件存在：" + newFilePath + '   ' + 'action访问路径：' + url);
        setActionRouter(app, url, 'actions' + url);
        options = dealOptions({
            layout: getLayout(urlKey)
        }, getUserOptions(config.renderOptions[urlKey]));
        _res.renderPjax('actions/' + urlKey, options);
    } else {
        logger.error("[-->missing action<--]\r\n    action视图文件不存在：" + newFilePath + '.html');
        setActionRouter(app, url, 'error404');
        _res.render('error404');
    }
}

/**
 * 函数功能描述           :处理render时的其余自定义参数
 * @param       :options            带有模板的参数
 * @param       :userOptions            配置文件自定义参数
 * @returns     :将两个参数合并后反返回
 */
function dealOptions(options, userOptions) {
    if (userOptions) {
        for (var key in userOptions) {
            options[key] = userOptions[key];
        }

    }

    return options;
}

function getUserOptions(options) {
    if (typeof(options) === 'string' && options.toLowerCase().indexOf('mvc-config') === 0) {
        return readConfig(options.toLowerCase().indexOf('.json') > 0 ? options : options + ".json");
    } else {
        return options;
    }
}

function getUserRouter() {
    var userRouters = dRouter.getRouter(config.router);
    return userRouters;
}

/**
 * 函数功能描述           :新增路由注册，当出现404访问时先走进这里，由这里进行判断是ajax还是页面再或者真是404
 * @param       :app            express对象
 * @param       :url            文件对应的url地址
 * @param       :res           当前请求的response对象
 * @returns     :无
 */
module.exports.addAction = function(app, url, res) {
    var routers=getUserRouter();
    var _tmpUrl=url.substring(1);
    logger.warn("[-->register url<--]\r\n    用户输入url：" + url);
    if(routers!==null && typeof routers !=='undefined' && typeof routers[_tmpUrl]!==undefined&& routers[_tmpUrl] !== null)
    {
        url="\\"+routers[_tmpUrl];
    }
    logger.warn("[-->register url<--]\r\n    路由寻址url：" + url);
    var newFilePath = process.cwd() + "\\views\\actions" + url.replace(/\//ig, "\\");
    logger.warn("[-->register url<--]\r\n    注册url：" + url);
    if (loadAjax(app, url.substring(1), res) === false) {
        if (fs.existsSync(newFilePath + '.html') === true) {
            isExists(true, app, newFilePath, url, res);
        } else {
            newFilePath += '/index';
            if (fs.existsSync(newFilePath + '.html')) {
                isExists(true, app, newFilePath, url, res);
            } else {
                isExists(false, app, newFilePath, url, res);
            }
        }

    }

};

/**
 * 函数功能描述           :根据配置文件最后修改时间来读取，express中间件
 * @returns     :无
 */
module.exports.ReadConFigFile = function() {
    return function(req, res, next) {
        var stat = fs.statSync('./mvc-config.json'),
            data = null;
        //当文件修改时间发生变化且当前不是online模式时才会动态读取
        if (configFileCurrentModifyTime !== (stat.mtime + '') && global.logRank !== '-online') {
            logger.warn("[-->config<--]\r\n    配置文件mvc-config.json发生变化，重载配置文件");
            config = JSON.parse(fs.readFileSync('./mvc-config.json', 'utf-8'));
            configFileCurrentModifyTime = stat.mtime + '';
            helper.registerHelper(config.helper);

        }
        hbs.registerPartials(__dirname + '/views/partials');
        next();

    };
};
