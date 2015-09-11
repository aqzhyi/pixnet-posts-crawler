# PIXNET crawler

> A crawler for PIXNET blog

## Usage

#### .findAll()

```
@param {object} opts
@param {string} opts.url - 部落格首頁網址，該網址必須包含分頁連結。
@param {boolean} opts.fetchAll - 是否只取第一頁的文章。設為 true 則撈取全部分頁的文章清單。
@returns {promise<Article[]>}
```

```js
import crawler from 'pixnet-posts-crawler'

let articles = await = crawler.findAll({ url: 'http://money9992.pixnet.net/blog' })

console.log(articles)
// [
//  {
//    url: String<Url>
//    title: String
//    published: String<ISO8601>
//  }
// ]
```

#### .find()

```
@param {string} opts
@param {string} opts.url - 文章的 URL。
@returns {promise<Article>}
```

```js
import crawler from 'pixnet-posts-crawler'

let article = await crawler.find({ url: 'http://money9992.pixnet.net/blog/post/427735169' })

console.log(result)
// {
//   address: Array[String<臺灣地址>]
//   body: String<HTMLString>
//   published: String<ISO8601>
//   images: Array[String<URL>]
//   title: String
//   url: String<Url> # direct post url
// }
```

## Interface

#### Article

```
@property {string[]} address - 正體中文，臺灣格式地址。採用內文分析，所以並非 100% 截取精確。
@property {string[]} images - 文章內所有 img 標籤的 URL。
@property {string} body - 文章內文。去頭去尾，只取 content。
@property {string} published - 文章公開時間。ISO8601 格式。
@property {string} title - 文章標題。
@property {string} url - 文章網址。
```

## Development Flow

```sh
vi src/index.js
:wq
npm test
# once dev done
npm run build
```

## Test

```sh
npm test
```

![](http://i.imgur.com/HFxUVHo.png)
