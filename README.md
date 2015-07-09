# pixnet-posts-crawler

> A crawler for PIXNET

## Usage

> findAll({ url: String, maxPage: Number })

```js
import crawler from 'pixnet-posts-crawler'

crawler
  .findAll({ url: 'http://money9992.pixnet.net/blog' })
  .then((result) => {
    console.log(result)
    // [
    //  {
    //    url: String<Url> # direct post url
    //    title: String
    //    datetime: String<ISO8601>
    //  }
    // ]
  })
```

> find({ url: String })

```js
import crawler from 'pixnet-posts-crawler'

crawler
  .find({ url: 'http://money9992.pixnet.net/blog/post/427735169' })
  .then((result) => {
    console.log(result)
    // {
    //   address: Array[String<臺灣地址>]
    //   body: String<HTMLString>
    //   datetime: String<ISO8601>
    //   images: Array[String<URL>]
    //   title: String
    //   url: String<Url> # direct post url
    // }
  })
```

## Development

```sh
npm run dev
```

## Test

```sh
DEBUG=pixnet-posts-crawler:* npm test
```

## DEBUG scopes

- `pixnet-posts-crawler:*`
- `pixnet-posts-crawler:findAll`
