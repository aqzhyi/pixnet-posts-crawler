import _ from 'lodash'
import {expect} from 'chai'
import crawler from '../dist/index'

describe('findAll()', function() {

  this.timeout(10000)

  it('Basic usage', () => {

    return crawler
    .findAll({ url: 'http://money9992.pixnet.net/blog' })
    .then((result) => {

      expect(result).to.be.an('array')

      _.each(result, (item) => {

        expect(item).to.include.keys('url', 'title', 'datetime')
        expect(item.url).to.be.a('string').to.match(/https?:\/\//i)
        expect(item.title).to.be.a('string')
        expect(item.datetime).to.be.a('string')
        expect(new Date(item.datetime).toString()).to.not.match(/invalid/i)
      })
    })
  })

  it('maxPage as argument', () => {

    // maxPage tests
    let promises = [1, 2, 7]

    return Promise.all(promises.map((maxPage) => {

      return crawler
      .findAll({ url: 'http://money9992.pixnet.net/blog', maxPage: maxPage })
      .then((result) => {

        expect(result).to.be.an('array')
        expect(result).length.to.not.above(10 * maxPage)
        expect(result).length.to.above(10 * maxPage - 1)
      })
    }))

  })
})
