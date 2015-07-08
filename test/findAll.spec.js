import {expect} from 'chai'
import crawler from '../dist/index'
import _ from 'lodash'

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
})
