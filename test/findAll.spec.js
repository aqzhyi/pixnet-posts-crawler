import _ from 'lodash'
import {expect} from 'chai'
import crawler from '../src/index'
import isUrl from 'is-url'
import isISOString from 'isostring'

describe('findAll()', function() {

  this.timeout(10000)

  it('fetchAll: false', async () => {

    let articles = await crawler.findAll({
      url: 'http://money9992.pixnet.net/blog',
      fetchAll: false,
    })

    expect(articles).to.be.an('array')
    expect(articles).to.have.length.below(21)
    _.forEach(articles, (item) => expect(item).to.be.an('object'))
  })

  it('fetchAll: true', async () => {

    let articles = await crawler.findAll({
      url: 'http://money9992.pixnet.net/blog',
      fetchAll: true,
    })

    expect(articles).to.be.an('array')
    expect(articles).to.have.length.above(20)
    _.forEach(articles, (item) => expect(item).to.be.an('object'))
  })

  it('Basic properties', async () => {

    let articles = await crawler.findAll({
      url: 'http://money9992.pixnet.net/blog',
      fetchAll: false,
    })

    _.each(articles, (item) => {

      expect(isISOString(item.published)).to.equal(true, '必須要有 published')
      expect(isUrl(item.url)).to.equal(true, '必須要有 url')
      expect(item.title).to.be.a('string', '必須要有 title')
      expect(item).to.include.keys('url', 'title', 'datetime')
    })
  })
})
