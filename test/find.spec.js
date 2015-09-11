import _ from 'lodash'
import {expect} from 'chai'
import crawler from '../src/index'
import isISOString from 'isostring'
import isUrl from 'is-url'


describe('find()', function() {

  this.timeout(10000)

  it('Basic usage', async () => {

    let article = await crawler.find({
      url: 'http://money9992.pixnet.net/blog/post/427735169'
    })

    expect(article).to.be.an('object')
    expect(article).to.include.keys('title', 'url', 'published', 'body', 'images', 'address')

    expect(article.title).to.be.a('string', '必須要有 title')

    expect(isUrl(article.url)).to.equal(true, '必須要有 url :string<URL>')

    expect(isISOString(article.published)).to.equal(true, '必須要有 published :string<ISO8601>')

    expect(article.body).to.be.a('string', '必須要有 body :string<HTMLString>')

    expect(article.images).to.be.an('array')
    _.each(article.images, (img) => expect(isUrl(img)).to.equal(true, 'images 裡的物件必須是 url :string<URL>'))

    expect(article.address).to.be.an('array')
    _.each(article.address, (addr) => expect(addr).to.be.a('string', 'images 裡的物件必須是 地址 :string'))
  })
})
