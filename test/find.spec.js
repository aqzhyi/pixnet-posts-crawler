import {expect} from 'chai'
import crawler from '../src/index'
import _ from 'lodash'

describe('find()', function() {

  this.timeout(10000)

  it('Basic usage', () => {

    return crawler
    .find({ url: 'http://money9992.pixnet.net/blog/post/427735169' })
    .then((result) => {

      expect(result).to.be.an('object')
      expect(result).to.include.keys('title', 'url', 'datetime', 'body', 'images', 'address')

      expect(result.title).to.be.a('string')
      expect(result.url).to.match(/https?:\/\//i)
      expect(result.datetime).to.be.a('string')
      expect(new Date(result.datetime).toString()).to.not.match(/invalid/i)
      expect(result.body).to.be.a('string')
      expect(result.images).to.be.an('array')
      _.each(result.images, (img) => expect(img).to.match(/https?:\/\//i))
      expect(result.address).to.be.an('array')
      _.each(result.address, (img) => expect(img).to.be.a('string'))
    })
  })
})
