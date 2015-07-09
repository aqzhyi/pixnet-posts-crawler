import $ from 'cheerio'
import _ from 'lodash'
import addressDigger from 'html-taiwan-address-digger'
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

  logFindAll(`現在抓取目標: ${URL}`)
  return request({
    method: 'GET',
    url: URL,
    json: false,
  })
  .then((bodyString) => $('<pixnet>').append(bodyString))
  .then(($body) => {
    let $posts = $body.find('.article')

    logFindAll(`找出有 ${$posts.length} 篇文章實例，開始解析各篇文章表面細節。`)
    let posts = _.map($posts, (articleElement) => {
      let $element = $(articleElement)

      let $pub = $element.find('.publish')
      let month = $pub.find('.month').text().trim() // Jul
      let date = $pub.find('.date').text().trim() // 07
      let year = $pub.find('.year').text().trim() // 2015
      let time = $pub.find('.time').text().trim() // 13:12

      let datetime = new Date(`${month} ${date} ${year} ${time}`)
      datetime = (datetime.toString().match(/invalid/i)) ? null : datetime.toISOString()

      let $title = $element.find('.title')
      let title = $title.find('a').text().trim()

      let url = $title.find('a').attr('href').trim()

      return {
        datetime,
        title,
        url,
      }
    })

    return posts
  })
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
