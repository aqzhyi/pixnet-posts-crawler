import $ from 'cheerio'
import _ from 'lodash'
import addressDigger from 'html-taiwan-address-digger'
import async from 'async'
import debug from 'debug'
import he from 'he'
import imgDigger from 'html-img-digger'
import request from 'request-promise'

let logFind = debug(`pixnet-posts-crawler:find`)
let logFindAll = debug(`pixnet-posts-crawler:findAll`)

function find(opts = {}) {
  if (!opts.url || typeof opts.url !== 'string') {
    return Promise.reject('Need url. API Documents => crawler.find({ url:String })')
  }

  logFind(`來抓取 ${opts.url}`)

  return request({
    method: 'GET',
    url: opts.url,
    json: false,
  })
  .then((result) => $(result))
  .then(($body) => {

    let $article = $body.find('#article-area').find('script,style,textarea').remove().end()

    let body = ''
    body = $article.html().trim()
    body = he.decode(body)

    let imgQ = imgDigger.dig(body)
    let addressQ = addressDigger.dig(body)

    let datetime = datetimeDig($article)

    let title = titleDig($article)

    return Promise
    .all([imgQ, addressQ])
    .then(([images, address]) => {

      images = images.map((img) => {

        if (img.url.indexOf('//') === 0) {
          img.url = `http:${img.url}`
        }

        return img.url
      })

      return {
        address,
        body,
        datetime,
        images,
        title,
        url: opts.url,
      }
    })
  })
}

function findAll(opts = {}) {
  if (!opts.url || typeof opts.url !== 'string') {
    return Promise.reject('Need url, findAll({ url:String })')
  }

  const URL = opts.url
  const MAX_PAGE = opts.maxPage || 1

  let maxPageDigged = crawlPages(URL).then((maxPage) => {

    logFindAll(`部落格總共有 ${maxPage} 頁，設定最多抓 ${MAX_PAGE} 頁。`)

    if (maxPage >= MAX_PAGE) {
      var pageRange = MAX_PAGE
    }

    logFindAll(`現在開始抓取，到最多第 ${pageRange} 頁`)

    return pageRange
  })

  .then((pageRange) => {

    // 同時最多 N 條線
    const THREADS_AT_SAME_TIME = 3

    // 總共 [1,2,3,4,...N] 頁
    let pageRanges = _.range(1, pageRange + 1)

    logFindAll(`同時開了 ${THREADS_AT_SAME_TIME} 條連線，發動請求！`)

    // send requests
    return new Promise((ok, bad) => {

      let list = []

      async.eachLimit(pageRanges, THREADS_AT_SAME_TIME, (page, done) => {

        let blogUrl = `${URL}/${page}`
        let crawled = crawlList(blogUrl)

        // concat requested lists
        crawled
        .then((result) => {
          list = list.concat(result)
          done()
        }, done)

      }, (err) => {
        if (err) {
          return bad(err)
        }
        else {
          return ok(list)
        }
      })
    })
  })

  return maxPageDigged
}

function crawlPages(url) {

  return request({
    method: 'GET',
    url: url,
    json: false,
  })
  .then((bodyString) => $(bodyString))
  .then(($body) => maxPageDig($body))
}

function crawlList(url) {

  logFindAll(`現在抓取清單，目標: ${url}`)
  return request({
    method: 'GET',
    url: url,
    json: false,
  })
  .then((bodyString) => $(bodyString))
  .then(($body) => {
    let $posts = $body.find('.article')

    logFindAll(`找出有 ${$posts.length} 篇文章實例，開始解析各篇文章表面細節。`)
    let posts = _.map($posts, (articleElement) => {
      let $element = $(articleElement)

      let datetime = datetimeDig($element)

      let title = titleDig($element)

      let $url = $element.find('.title')
      let postUrl = $url.find('a').attr('href').trim()

      return {
        datetime,
        title,
        url: postUrl,
      }
    })

    return posts
  })
}

function maxPageDig($element) {

  let alinks = $element.find('.page a')

  let pages = _.map(alinks, (aElement) => {
    let pageNum = Number($(aElement).text())
    if (Number.isNaN(pageNum)) {
      return 0
    }

    return pageNum
  })

  let maxPage = _.max(pages)

  return maxPage
}

function datetimeDig($element) {

  let $pub = $element.find('.publish')
  let month = $pub.find('.month').text().trim() // Jul
  let date = $pub.find('.date').text().trim() // 07
  let year = $pub.find('.year').text().trim() // 2015
  let time = $pub.find('.time').text().trim() // 13:12

  let datetime = new Date(`${month} ${date} ${year} ${time}`)
  datetime = (datetime.toString().match(/invalid/i)) ? null : datetime.toISOString()

  return datetime
}

function titleDig($element) {

  let $title = $element.find('.title')
  let title = $title.find('a').text().trim()

  return title
}

export default {
  find,
  findAll,
}
