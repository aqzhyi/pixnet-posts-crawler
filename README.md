# pixnet-posts-crawler

> A crawler for PIXNET

## Usage

> findAll({ url: String })

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
