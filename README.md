# WebBits
Web / Tech /eCommerce news repository.

![Travis-CI](https://travis-ci.org/lmarkus/WebBits.svg)

* **current.json**: News bit shown by default.
* **next.json**: Buffer for next week's edition.

If you have any news bits you'd like to contribute, add them to `next.json` via pull req (Or just hit me [@lennymarkus](https://twitter.com/lennyMarkus))

A story format is just:

```json
{    
    "category": "Commerce | CSS | Technology | Featured | etc...", 
    "headline": "This is a cool tech story",
    "urls": ["http://url1.com", "http://url2.com"]
}
```