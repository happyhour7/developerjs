var styles = {
    'bold' : '\x1B[1m%s\x1B[0m',
    'italic' : '\x1B[3m%s\x1B[0m',
    'underline' : '\x1B[4m%s\x1B[0m',
    'inverse' : '\x1B[7m%s\x1B[0m',
    'strikethrough' : '\x1B[9m%s\x1B[0m',
    'white' : '\x1B[37m%s\x1B[0m',
    'grey' : '\x1B[90m%s\x1B[0m',
    'black' : '\x1B[30m%s\x1B[0m',
    'blue' : '\x1B[34m%s\x1B[0m',
    'cyan' : '\x1B[36m%s\x1B[0m',
    'green' : '\x1B[32m%s\x1B[0m',
    'magenta' : '\x1B[35m%s\x1B[0m',
    'red' : '\x1B[31m%s\x1B[0m',
    'yellow' : '\x1B[33m%s\x1B[0m',
    'whiteBG' : '\x1B[47m%s\x1B[0m',
    'greyBG' : '\x1B[49m%s\x1B[0m',
    'blackBG' : '\x1B[40m%s\x1B[0m',
    'blueBG' : '\x1B[31%s\x1B[0m',
    'cyanBG' : '\x1B[46m%s\x1B[0m',
    'greenBG' : '\x1B[42m%s\x1B[0m',
    'magentaBG' : '\x1B[45m%s\x1B[0m',
    'redBG' : '\x1B[41m%s\x1B[0m',
    'yellowBG' : '\x1B[43m%s\x1B[0m'
};

module.exports = {
    log : function(text, type) {
        var logType, //日志的类型，page，ajax，pjax，success
        logrank;
        //日志级别，默认debug
        if ( typeof (type) === 'undefined') {
            logType = 'success';
            logrank = '-debug';
        } else if ( typeof (type) === 'string') {
            logType = type;
            logrank = '-debug';
        } else if ( typeof (type) === "object") {
            logType = type.type || "success";
            logrank = type.rank || "-debug";
        }
        global.logRank=global.logRank||'-dev';
        if (logrank !== global.logRank)
        {
            return;
        }
            
        var colors = {
            ajax : styles.magenta,
            page : styles.cyan,
            pjax : styles.blue,
            success : styles.green
        };
        console.log(colors[logType], text);
    },

    error : function(text, opts) {
        var logRank = typeof (opts) === 'undefined' ? '-debug' : (opts.rank || '-debug');
        global.logRank=global.logRank||'-dev';
        if (logRank !== global.logRank)
            return;
        console.log(styles.red, text);
    },

    warn : function(text, opts) {
        var logRank = typeof (opts) === 'undefined' ? '-debug' : (opts.rank || '-debug');
        global.logRank=global.logRank||'-dev';
        if (logRank !== global.logRank)
            return;
        console.log(styles.yellow, text);
    }
};

