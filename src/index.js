import _ from 'lodash'
import $ from 'cheerio'
import debug from 'debug'
import request from 'request-promise'

let logFindAll = debug(`pixnet-posts-crawler:findAll`)

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

export default {
  findAll,
}
