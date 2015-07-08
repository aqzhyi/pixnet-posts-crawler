(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'lodash', 'cheerio', 'debug', 'request-promise'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('lodash'), require('cheerio'), require('debug'), require('request-promise'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global._, global.$, global.debug, global.request);
    global.index = mod.exports;
  }
})(this, function (exports, module, _lodash, _cheerio, _debug, _requestPromise) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _2 = _interopRequireDefault(_lodash);

  var _$ = _interopRequireDefault(_cheerio);

  var _debug2 = _interopRequireDefault(_debug);

  var _request = _interopRequireDefault(_requestPromise);

  var logFindAll = (0, _debug2['default'])('pixnet-posts-crawler:findAll');

  function findAll() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    if (!opts.url || typeof opts.url !== 'string') {
      return Promise.reject('Need url, findAll({ url:String })');
    }

    var URL = opts.url;

    logFindAll('現在抓取目標: ' + URL);
    return (0, _request['default'])({
      method: 'GET',
      url: URL,
      json: false
    }).then(function (bodyString) {
      return (0, _$['default'])('<pixnet>').append(bodyString);
    }).then(function ($body) {
      var $posts = $body.find('.article');

      logFindAll('找出有 ' + $posts.length + ' 篇文章實例，開始解析各篇文章表面細節。');
      var posts = _2['default'].map($posts, function (articleElement) {
        var $element = (0, _$['default'])(articleElement);

        var $pub = $element.find('.publish');
        var month = $pub.find('.month').text().trim(); // Jul
        var date = $pub.find('.date').text().trim(); // 07
        var year = $pub.find('.year').text().trim(); // 2015
        var time = $pub.find('.time').text().trim(); // 13:12

        var datetime = new Date(month + ' ' + date + ' ' + year + ' ' + time);
        datetime = datetime.toString().match(/invalid/i) ? null : datetime.toISOString();

        var $title = $element.find('.title');
        var title = $title.find('a').text().trim();

        var url = $title.find('a').attr('href').trim();

        return {
          datetime: datetime,
          title: title,
          url: url
        };
      });

      return posts;
    });
  }

  module.exports = {
    findAll: findAll
  };
});