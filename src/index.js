import $ from 'cheerio'
import _ from 'lodash'
import addressDigger from 'html-taiwan-address-digger'
import async from 'async-q'
import debug from 'debug'
import he from 'he'
import imgDigger from 'html-img-digger'
import request from 'request-promise'
import isISOString from 'isostring'

let logRoot = debug('pixnet-posts-crawler')
const NODE_ENV = process.env.NODE_ENV || 'development'

async function find(opts = {}) {

  let log = debug(`${logRoot.namespace}:find`)

  if (!opts.url || typeof opts.url !== 'string') {
    return Promise.reject('Need url. API Documents => crawler.find({ url:String })')
  }

  log(`find ${opts.url}`)

  let response = await request({
    method: 'GET',
    url: opts.url,
    json: false,
  })

  let $body = $(response)

  let $article = $body.find('#article-area').find('script,style,textarea').remove().end()

  let body = ''
  body = $article.html().trim()
  body = he.decode(body)

  let imgQ = imgDigger.dig(body)
  let addressQ = addressDigger.dig(body)

  let published = datetimeDig($article)

  let title = titleDig($article)

  let [images, address] = await Promise.all([imgQ, addressQ])

  images = images.map((img) => {

    if (img.url.indexOf('//') === 0) {
      img.url = `http:${img.url}`
    }

    return img.url
  })

  return {
    address,
    body,
    published,
    images,
    title,
    url: opts.url,
  }
}

async function findAll(opts = {}) {
  let log = debug(`${logRoot.namespace}:findAll`)

  if (!opts.url || typeof opts.url !== 'string') {
    return Promise.reject('Need url, findAll({ url:String })')
  }

  // 同時最多 N 條線
  const THREADS_AT_SAME_TIME = 2
  const URL = opts.url
  const FETCH_ALL = (opts.fetchAll === true) ? true : false
  let pageRanges = _.range(1, 2) // [1]
  let articles = []

  if (FETCH_ALL === true) {
    let maxPageAmount = await crawlPages(URL)

    log(`部落格總共有 ${maxPageAmount} 頁，是否強制抓取全部頁面:${FETCH_ALL}`)

    // [1,2,3,4,...N] 頁
    pageRanges = _.range(1, maxPageAmount + 1)
  }

  log(`同時開了 ${THREADS_AT_SAME_TIME} 條連線，發動請求！`)

  if (NODE_ENV.match(/test/i)) {
    log(`NODE_ENV:${NODE_ENV}，處理 pageRanges 變量，使它最多問三頁。`)

    pageRanges = pageRanges.slice(0, 3)
  }

  // send requests
  await async.eachLimit(pageRanges, THREADS_AT_SAME_TIME, async (page) => {
    let blogUrl = `${URL}/${page}`
    let crawled = await crawlList(blogUrl)
    articles = articles.concat(crawled)
  })

  return articles
}

/**
@param {string} url - Blogger blog's url that max page amount you want to know
@returns {number} Max page amount
*/
function crawlPages(url) {

  return request({
    method: 'GET',
    url: url,
    json: false,
  })
  .then((bodyString) => $(bodyString))
  .then(($body) => maxPageDig($body))
}

/**
@param {string} url - Blogger blog's url
@returns {object.<datetime, title, url>[]}
*/
function crawlList(url) {

  let log = debug(`${logRoot.namespace}:_crawlList`)

  log(`現在抓取清單，目標: ${url}`)
  return request({
    method: 'GET',
    url: url,
    json: false,
  })
  .then((bodyString) => $(bodyString))
  .then(($body) => {
    let $posts = $body.find('.article')

    log(`找出有 ${$posts.length} 篇文章實例，開始解析各篇文章表面細節。`)
    let posts = _.map($posts, (articleElement) => {
      let $element = $(articleElement)

      let published = datetimeDig($element)

      let title = titleDig($element)

      let $url = $element.find('.title')
      let postUrl = $url.find('a').attr('href').trim()

      return {
        published,
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
  let isostring = datetime.toISOString()
  isostring = (isISOString(isostring)) ? isostring : ''

  return isostring
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
