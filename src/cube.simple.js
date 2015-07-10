/**
 * @desc 简易模块加载器，cube.simple
 * @author berryliu
 * @time 2015-07-09.
 */


/**
 * @desc 模块调用与执行
 * @params name {String} 模块名
 * @return 模块信息
 * @todo 缓存检测、模块名解析、模块加载、模块执行、缓存更新
 */

var modCache = {};
var currentMod = null;  // 不清楚这个是干嘛的

function getModule(name) {

    // 缓存检测
    if (name in modCache) {
        return modCache[name];
    }

    var module = {
        exports: null,  // 模块输出
        loaded: false,
        onLoad: []
    };

    // 缓存更新
    modCache[name] = module;    // 不管加载完没

    readFile(name, function (code) {
        currentMod = module;

        // 模块执行
        (new Function('', code))();
    });

    return module;
}

/**
 * @desc 模块定义
 * @params deps {Array} 依赖模块数组
 * @params fn {Function} 模块工厂方法
 */
function define(depNames, fn) {
    var myMod = currentMod;
    var deps = depNames.map(getModule);

    deps.forEach(function (mod) {
        if (!mod.loaded) {
            mod.onLoad.push(whenDepsLoaded);
        }
    });

    whenDepsLoaded();

    function whenDepsLoaded() {
        console.log('times');
        var allIsReady = deps.every(function (m) {
            return m.loaded;
        });
        if (!allIsReady) {
            return;
        }

        var args = deps.map(function (m) {
            return m.exports;
        });

        var exports = fn.apply(null, args);

        if (myMod) {
            myMod.exports = exports;
            myMod.loaded = true;
            myMod.onLoad.forEach(function (f) {
                f();
            });

        }
    }

}

/**
 * @desc readFile 模块文件加载
 * @params name {String} 模块名
 * @return code
 */
function readFile(url, callback) {
    // 文件名兼容
    var suffixReg = /\.js$/g;
    if (!suffixReg.test(url)) {
        url += '.js';
    }
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.addEventListener('load', function () {
        if (req.status < 400) {
            callback(req.responseText);
        }
    });
    req.send();
}
