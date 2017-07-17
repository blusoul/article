# 区划代码 node 版爬虫尝试

## 前言

对于区划代码数据，很多人都不会陌生，大多公司数据库都会维护一份区划代码，包含省市区等数据。区划信息跟用户信息息息相关，往往由于历史原因很多数据都是比较老的数据，且不会轻易更改。网上也有很多人提供的数据，或许大多数数据已经老旧，尽管并不会影响太多。

网上只提供数据，好像很少有人提供方法。最近有时间就来做一次爬虫的初尝，有想法但无奈没学 python，就拼凑了个 node 版的。

## 第一步 找资源

地名服务资源一般只有政府部门才有权威性，比对某些网上提供的资源发现并不靠谱，特别是县以下的区划代码。搜索到以下资源：

* [中华人民共和国民政部-2017年3月中华人民共和国县以上行政区划代码](http://www.mca.gov.cn/article/sj/tjbz/a/2017/201703/201705051139.html)

* [中华人民共和国国家统计局-2015年统计用区划代码和城乡划分代码(截止2015年09月30日)](http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2015/index.html)

* [中华人民共和国民政部-2013年中华人民共和国县以下行政区划代码](http://files2.mca.gov.cn/cws/201404/20140404125738290.htm)

* [中华人民共和国民政部-中华人民共和国行政区划代码](http://www.mca.gov.cn/article/sj/tjbz/a/)

* [中华人民共和国国家统计局>>统计数据](http://www.stats.gov.cn/tjsj/)

* [中华人民共和国民政部-服务-政策解答-区划地名](http://www.mca.gov.cn/article/fw/zcjd/qhdm/)

* [地名普查办--系统维护中](http://dmpc.mca.gov.cn/)

* [博雅地名分享网](http://www.tcmap.com.cn/)

结果发现，政府没有提供统一的数据，区划信息比较分散，县级以上的数据有提供 2017 最新版的数据，但县级以下的数据只有 2013 年 和 2015 年的数据，以及每年来县级以下的数据变更情况。但 2013 和 2015 以不同的方式展示，一个页面的数据还是比较容易获取，如 2013 年的数据。但 2015 年数据尽管是分散在不同的页面中，还是有一定的规律的。另外博雅地名分享网的数据相对比较新，但与官方比较还是有些差异。这次以 2015 的数据为例

## 第二步 搭环境

node 环境提供了众多包，可以方便的实现一些功能，下面只是这些工具包在本次爬虫的所用到的功能，更多资料网上有很多，不过多说明（其实我是不完全会用这些工具，只是用了部分功能去实现而已~~捂脸）

    request       // 请求
    cheerio       // node 版的 jQuery
    iconv-lite    // 请求返回的数据转码
    async         // 处理并发请求数

## 第三步 书写代码

观察区划代码，你就会发现一些规律，根据这些规律，可以把省市区的数据格式化成自己想要的格式

    省级或直辖市： 第三，四位是 00
    市级： 第五，六位是 00
    省级直辖县： 第三，四位是 90

### 编码规则 引自[维基百科](https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%92%E4%BB%A3%E7%A0%81)

> 代码从左至右的含义是：  
第一、二位表示省级行政单位（省、自治区、直辖市、特别行政区），其中第一位代表大区。  
第三、四位表示地级行政单位（地级市、地区、自治州、盟及省级单位直属县级单位的汇总码）。  
&emsp;&emsp;对于省（自治区）下属单位：01-20，51-70表示省辖市（地级市）；21-50表示地区（自治州、盟）；90表示省（自治区）直辖县级行政区划的汇总。  
&emsp;&emsp;对于直辖市下属单位：01表示市辖区的汇总；02表示县的汇总。  
第五、六位表示县级行政单位（县、自治县、市辖区、县级市、旗、自治旗、林区、特区）。  
&emsp;&emsp;对于地级市下属单位：01-20表示市辖区（特区）；21-80表示县（旗、自治县、自治旗、林区）；81-99表示地级市代管的县级市。  
&emsp;&emsp;对于直辖市所辖县级行政单位：01-20、51-80代表市辖区；21-50代表县（自治县）。  
&emsp;&emsp;对于地区（自治州、盟）下属单位：01-20表示县级市；21-80表示县（旗、自治县、自治旗）。  
&emsp;&emsp;对于省级直辖县级行政单位：同地区。

1. 需要把获取的数据写入 json 文件就需要 fs

```js
// require 需要的包
const fs = require('fs');
const entryUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2015/index.html';
const writeJSON = fs.createWriteStream(__dirname + '/data/list-2015.json')

// 待写入的 JSON 数据
let listJSON = {};
```

2. 需要获取首页的数据

![2015年统计用区划代码](https://raw.githubusercontent.com/blusoul/article/master/practise/division-code/img/20170513232401.png)

上代码展示，写的比较 low

```js
function captureUrl(url, fn, provinceName) {
  request.get({
    url: url,
    encoding: null //让 body 直接是 buffer，也有别的方法实现
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {

      // 页面编码为 gb2312 需要转码
      const convertedHtml = iconv.decode(body, 'gb2312');

      // 请求返回数据解析 jQuery 对象
      const $ = cheerio.load(convertedHtml, {
        decodeEntities: false
      });
      $.href = url;
      $.provinceName = provinceName;
      fn($);
    }
    if (error) {
      console.log('error: ' + url)
    }
  });
}

captureUrl(entryUrl, function (res) {
  parseHtml.deal(res, entryUrl);
});
```

3. 根据页面结构获取想要的数据，这里是链接和城市名，浏览器 f12 都能看得懂的哈~

![页面结构](https://raw.githubusercontent.com/blusoul/article/master/practise/division-code/img/20170513233355.png)

地址是相对路径，就需要根据请求的 url 地址来拼接出下一个页面真实地址

```js
// 相对路径地址转换
function combineLink({
  originUrl,
  spliceUrl
}) {
  if (typeof originUrl == 'string' && /^http/.test(originUrl)) {
    const lastIndex = originUrl.lastIndexOf('/');
    return originUrl.substr(0, lastIndex + 1) + spliceUrl;
  }
}
```

有了 cheerio 可以方便的获取页面节点，从而拿到我们想要的数据

```js
const parseHtml = {
  captureProvince($) {
    const linkList = $('.provincetr a');
    let provinceArr = [];

    linkList.map((index, item) => {
      // 循环 10 个省份能完好执行异步回调，超过就出现问题
      // if (index < 10) {
      const $item = $(item);
      provinceArr.push({
        url: combineLink({
          originUrl: entryUrl,
          spliceUrl: $item.attr('href')
        }),
        name: $item.text().trim()
      });
      // }
    });

    return provinceArr;
  }
}
```

有了链接就可以做下一步的处理，同样观察页面结构，获取有用的数据。这么多链接请求，到底什么时候会请求完成？这时候就有请 Promise 出场了

```js
// 省份链接
const provinceArr = parseHtml.captureProvince(res);

Promise.all(provinceArr.map(item => {
    const provinceName = item.name;
    const provinceUrl = item.url;
    return new Promise(resolve => {
        captureUrl(provinceUrl, resolve, provinceName);
    });
  })).then(res => {
    // 所有请求都结束
  }).catch(err => {
    // 异常处理
  });
```

以为就这样顺利的走下去，就大功告成了。可遗憾的是新的问题出现了。在抓取博雅网的时候并发请求过多，请求失败的异常链接会有很多，但这些链接并没有问题。这是网站的防御机制，我们伪造的合法请求触发网站的防御机制，或许叫 CC 攻击来实现 DDOS 。***貌似这么做对别的网站造成损失可能就要被请喝茶，请慎重***，这时候就需要限制并发数不妨碍别人网站经营，asyn 有很强大的功能，这里只用了 mapList 方法，目的限制并发数

```js
Promise.all(provinceArr.map(item => {
    const provinceName = item.name;
    const provinceUrl = item.url;
    return new Promise(resolve => {
        captureUrl(provinceUrl, resolve, provinceName);
    });
  }))
  .then(res => {
    let tempArr = [];
    res.map(item => {
        // 解析市一级数据
        tempArr = tempArr.concat(this.captureCity(item, item.href))
    });

    return new Promise(resolve => {
      async.mapLimit(tempArr, 10, function (item, callback) {
      let temp = [];
      captureUrl(item, function ($) {
          console.log(item);
          // 解析区县一级数据
          temp = temp.concat(parseHtml.captureCountry($));
          callback(null, temp);
      });
      }, function (err, result) {

        let tempArr = [];
        result.map(item => {
            tempArr = tempArr.concat(item);
        });
        resolve(tempArr);
      });
    });

  }).then(res => {
    return new Promise(resolve => {
        async.mapLimit(res, 10, function (item, callback) {
        let temp = [];
        captureUrl(item, function ($) {
          console.log(item);

          // 解析街道或者乡镇一级数据
          parseHtml.captureTown($);
          // 省份超过 10 个 callback 无效。找不到原因，不得已写法
          // fs.createWriteStream(__dirname + '/data/list-2015.json').write(JSON.stringify(listJSON));
          callback(null);
        });
      }, function (err, result) {
        console.log(err)
        resolve(true)
      });
    });
  }).then(res => {
    // 所有请求完成后 callback
    console.log('区划信息写入成功~')
    writeJSON.write(JSON.stringify(listJSON));
  }).catch(err => {
    console.log(err)
  });
```

处理数据过程中，可以对源数据加以处理，获取数据展示

```json
{
  "110000000":"北京市",
  "110101000":"东城区",
  "110101001":"东华门街道",
  "110101002":"景山街道"
  ...
  ...
}
```

## 第四步 update 数据

根据区划代码变更的页面获取数据来更新已经获取到的 2015 年的数据，采取同样的方法去拿到链接获取页面数据，发现这些变更情况的链接有重定向，需要做相应的处理才能拿到真实链接

```js
function getRedirectUrl($) {
  const scriptText = $('script').eq(0).text().trim();
  const matchArr = scriptText.match(/^window.location.href="(\S*)";/);
  if (matchArr && matchArr[1]) {
    return matchArr[1];
  } else {
    console.log('重定向页面转换错误~')
  }
}
```

在调试的过程中发现变更情况页面是表格类型，不能很方便的拿到数据并区分开来，不能只是左侧的数据需要 delete,右侧的数据 add。 我的思路是根据变更原因来分类处理，此部分代码没有写完

![变更情况](https://raw.githubusercontent.com/blusoul/article/master/practise/division-code/img/20170514102543.png)

## 调试

我使用的编辑工具是 VSCode,调试也比较方便，F5 写好 launch.json 就可调试了。 可能我只知道这种调试吧，哈哈哈~

## 结局

由于官方[地名普查办](http://dmpc.mca.gov.cn/)正在进行第二次地名普查，确保 2017 年 6 月 30 号完成全国地名普查工作，并向社会提供地名服务，详见[如何切实做好第二次全国地名普查验收工作](http://www.mca.gov.cn/article/fw/zcjd/qhdm/201704/20170400004094.shtml)

到时候看官方公布的数据情况，来决定要不要完成这个工作，目前不想浪费太多的时间在这个上面，耗费了时间得来的数据有偏差，将来可能是要负责任的， 得不偿失。在此只是提供一种思路，有兴趣的可以自己尝试，有好的方法可以推荐一下哈哈~

详细代码见 [division-code](https://github.com/blusoul/division-code)

## 疑惑

[async.mapList](http://caolan.github.io/async/docs.html#mapLimit)

    mapLimit(coll, limit, iterate, callback)

当循环省份超过 10 个时，回调执行写入区划信息会失败，也没执行 error，是不是我的用法有问题，望能得到解答

## 参考资料

[node API](https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options)

[async 控制并发](https://github.com/alsotang/node-lessons/tree/master/lesson5)