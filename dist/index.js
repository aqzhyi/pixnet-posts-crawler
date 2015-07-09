(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'cheerio', 'lodash', 'html-taiwan-address-digger', 'async', 'debug', 'he', 'html-img-digger', 'request-promise'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('cheerio'), require('lodash'), require('html-taiwan-address-digger'), require('async'), require('debug'), require('he'), require('html-img-digger'), require('request-promise'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.$, global._, global.addressDigger, global.async, global.debug, global.he, global.imgDigger, global.request);
    global.index = mod.exports;
  }
})(this, function (exports, module, _cheerio, _lodash, _htmlTaiwanAddressDigger, _async, _debug, _he, _htmlImgDigger, _requestPromise) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _$ = _interopRequireDefault(_cheerio);

  var _2 = _interopRequireDefault(_lodash);

  var _addressDigger = _interopRequireDefault(_htmlTaiwanAddressDigger);

  var _async2 = _interopRequireDefault(_async);

  var _debug2 = _interopRequireDefault(_debug);

  var _he2 = _interopRequireDefault(_he);

  var _imgDigger = _interopRequireDefault(_htmlImgDigger);

  var _request = _interopRequireDefault(_requestPromise);

  var logFind = (0, _debug2['default'])('pixnet-posts-crawler:find');
  var logFindAll = (0, _debug2['default'])('pixnet-posts-crawler:findAll');

  function find() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    if (!opts.url || typeof opts.url !== 'string') {
      return Promise.reject('Need url. API Documents => crawler.find({ url:String })');
    }

    logFind('來抓取 ' + opts.url);

    return (0, _request['default'])({
      method: 'GET',
      url: opts.url,
      json: false
    }).then(function (result) {
      return (0, _$['default'])(result);
    }).then(function ($body) {

      var $article = $body.find('#article-area').find('script,style,textarea').remove().end();

      var body = '';
      body = $article.html().trim();
      body = _he2['default'].decode(body);

      var imgQ = _imgDigger['default'].dig(body);
      var addressQ = _addressDigger['default'].dig(body);

      var datetime = datetimeDig($article);

      var title = titleDig($article);

      return Promise.all([imgQ, addressQ]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var images = _ref2[0];
        var address = _ref2[1];

        images = images.map(function (img) {

          if (img.url.indexOf('//') === 0) {
            img.url = 'http:' + img.url;
          }

          return img.url;
        });

        return {
          address: address,
          body: body,
          datetime: datetime,
          images: images,
          title: title,
          url: opts.url
        };
      });
    });
  }

  function findAll() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    if (!opts.url || typeof opts.url !== 'string') {
      return Promise.reject('Need url, findAll({ url:String })');
    }

    var URL = opts.url;
    var MAX_PAGE = opts.maxPage || 1;

    var maxPageDigged = crawlPages(URL).then(function (maxPage) {

      logFindAll('部落格總共有 ' + maxPage + ' 頁，設定最多抓 ' + MAX_PAGE + ' 頁。');

      if (maxPage >= MAX_PAGE) {
        var pageRange = MAX_PAGE;
      }

      logFindAll('現在開始抓取，到最多第 ' + pageRange + ' 頁');

      return pageRange;
    }).then(function (pageRange) {

      // 同時最多 N 條線
      var THREADS_AT_SAME_TIME = 3;

      // 總共 [1,2,3,4,...N] 頁
      var pageRanges = _2['default'].range(1, pageRange + 1);

      logFindAll('同時開了 ' + THREADS_AT_SAME_TIME + ' 條連線，發動請求！');

      // send requests
      return new Promise(function (ok, bad) {

        var list = [];

        _async2['default'].eachLimit(pageRanges, THREADS_AT_SAME_TIME, function (page, done) {

          var blogUrl = URL + '/' + page;
          var crawled = crawlList(blogUrl);

          // concat requested lists
          crawled.then(function (result) {
            list = list.concat(result);
            done();
          }, done);
        }, function (err) {
          if (err) {
            return bad(err);
          } else {
            return ok(list);
          }
        });
      });
    });

    return maxPageDigged;
  }

  function crawlPages(url) {

    return (0, _request['default'])({
      method: 'GET',
      url: url,
      json: false
    }).then(function (bodyString) {
      return (0, _$['default'])(bodyString);
    }).then(function ($body) {
      return maxPageDig($body);
    });
  }

  function crawlList(url) {

    logFindAll('現在抓取清單，目標: ' + url);
    return (0, _request['default'])({
      method: 'GET',
      url: url,
      json: false
    }).then(function (bodyString) {
      return (0, _$['default'])(bodyString);
    }).then(function ($body) {
      var $posts = $body.find('.article');

      logFindAll('找出有 ' + $posts.length + ' 篇文章實例，開始解析各篇文章表面細節。');
      var posts = _2['default'].map($posts, function (articleElement) {
        var $element = (0, _$['default'])(articleElement);

        var datetime = datetimeDig($element);

        var title = titleDig($element);

        var $url = $element.find('.title');
        var postUrl = $url.find('a').attr('href').trim();

        return {
          datetime: datetime,
          title: title,
          url: postUrl
        };
      });

      return posts;
    });
  }

  function maxPageDig($element) {

    var alinks = $element.find('.page a');

    var pages = _2['default'].map(alinks, function (aElement) {
      var pageNum = Number((0, _$['default'])(aElement).text());
      if (Number.isNaN(pageNum)) {
        return 0;
      }

      return pageNum;
    });

    var maxPage = _2['default'].max(pages);

    return maxPage;
  }

  function datetimeDig($element) {

    var $pub = $element.find('.publish');
    var month = $pub.find('.month').text().trim(); // Jul
    var date = $pub.find('.date').text().trim(); // 07
    var year = $pub.find('.year').text().trim(); // 2015
    var time = $pub.find('.time').text().trim(); // 13:12

    var datetime = new Date(month + ' ' + date + ' ' + year + ' ' + time);
    datetime = datetime.toString().match(/invalid/i) ? null : datetime.toISOString();

    return datetime;
  }

  function titleDig($element) {

    var $title = $element.find('.title');
    var title = $title.find('a').text().trim();

    return title;
  }

  module.exports = {
    find: find,
    findAll: findAll
  };
});