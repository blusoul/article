# JavaScript 之编码二 -- 编码转换

之前一直想弄明白 JavaScript 中的编码和解码函数是如何操作的，上一篇文章总结了一些概念和 JavaScript 中的编码函数，现在才做一次总结。

JavaScript 采用 Unicode 字符集，准确的说语言层面采用 USC-2 编码，具体可以看这篇文章[JavaScript’s internal character encoding: UCS-2 or UTF-16?](https://mathiasbynens.be/notes/javascript-encoding)

> USC-2： 用两个字节表示基本多文种平面(BMP) 的码位\
> UTF-8： 用一个到四个字节表示 Unicode 码位，一个字节（U+0000-U+007F），两个字节（）属于变长编码表达方式\
> UTF-16： 用两个字节（等同于 USC-2，区间 U+0000-UD7FF 和 U+E000-U+FFFF）或者四个字节（区间 U+10000-U+10FFFF）表示码位，四个字节表示辅助平面中的码位，也叫代理对，分前导代理（高位代理）和后尾代理（低位代理）。UTF-16 也属于变长表达编码方式。\
> UTF-32： 用四个字节表示 Unicode 码位\
> Base64： 用四个 6 比特的单元来表示三个字节

## 示例

本例使用 E（U+0045），ø（U+00F8）， 编（U+7F16） 和 😊 (U+1F60A)作为示例，分别为一到四字节，通过 [codepoints](https://codepoints.net/) 查得

### 获取字符的 Unicode 码位，String.prototype.charCodeAt() & String.prototype.codePointAt()

```javascript
(function() {
const testArr = ['E','ø','编','😊'];
function toUnicode(arr, type){
  return arr.map(item => item[type](0).toString(16).toUpperCase());
}

console.log(toUnicode(testArr, 'charCodeAt')); // ["45", "F8", "7F16", "D83D"]
console.log(toUnicode(testArr, 'codePointAt')); // ["45", "F8", "7F16", "1F60A"]
})();
```

通过对比发现 charCodeAt() 方法对于 Unicode 码位大于 0x10000 的不能正常返回，会把代理对当作两个码元。
对于Unicode 大于 0x10000 辅助平面中的码位在 UTF-16 在UTF-16中被编码为一对16比特长的码元。具体如下：

1. 码位减去 0x10000，得到 20 比特长的值。例子中：0x1F60A - 0x10000，得到 0x0F60A，二进制为 0000111101 1000001010;

1. 上10位的值加上 0xD800，0xD800 + 0x003D，即前导代理为 0xD83D，也就是 charCodeAt() 取到的值

1. 下10位的值加上 0xDC00， 0xDC00 + 0x020A，即后尾代理为 0xDE0A

1. U+1F60A 在 UTF-16 的编码大端序为 D83D DE0A，小端序则为 DE0A D83D

### 那如果把一个 Unicode 码位转换为字符？

```javascript
// 字符串法
'\u7F16'; // 编
'\u1F604'; // "ὠ4" wrong
// 对于大于 0x10000 的
'\u{1F604}' + ''; // "😄"
'\uD83D\uDE0A'; // "😄"

String.fromCodePoint(0x1F604); // "😄"
String.fromCharCode(0x1F604); // "" wrong
// 计算出对应的代理对
String.fromCharCode(0xD83D, 0xDE0A); // "😄"

// length "😄" 在 JavaScript 中编码为 \uD83D\uDE0A
'😄'.length; // 2
Array.from('😄').length; // 1
```

String.fromCharCode 和 String.prototype.charCodeAt 同样有局限性，只能转换连个字节的 BMP

### UTF-16 编码

根据需要编码的 Unicode 码位找到对应区间，使用对应的方法进行手工编码，网上也有提供方法，见 [Unicode and JavaScript](http://2ality.com/2013/09/javascript-unicode.html)

```javascript
function toUTF16(codePoint) {
  var TEN_BITS = parseInt('1111111111', 2);
  function u(codeUnit) {
    return '\\u'+codeUnit.toString(16).toUpperCase();
  }

  if (codePoint <= 0xFFFF) {
    return u(codePoint);
  }
  codePoint -= 0x10000;

  // Shift right to get to most significant 10 bits
  var leadSurrogate = 0xD800 + (codePoint >> 10);

  // Mask to get least significant 10 bits
  var tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);

  return u(leadSurrogate) + u(tailSurrogate);
}
```

也有另一种转换，见 [JavaScript’s internal character encoding: UCS-2 or UTF-16?](https://mathiasbynens.be/notes/javascript-encoding)

```javascript
H = Math.floor((C - 0x10000) / 0x400) + 0xD800;
L = (C - 0x10000) % 0x400 + 0xDC00;
// to Unicode
C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000
```

### [UTF-8 编码](https://zh.wikipedia.org/wiki/UTF-8)

比如： 编（U+7F16）

1. U+7F16 在 000800 - 00D7FF 之间对应三个字节，所以最终会是 1110xxxx 10yyyyyy 10zzzzzz

1. 7F16 对应的二进制为 0111 111100 010110

1. 按顺序放入对应的 x y z ： 11100111 10111100 10010110

1. 转换为十六进制为 E7 BC 96

### encodeURI & enCodeURIComponent

这两个函数会按各自规则对需要编码的字符串进行 UTF-8 编码，并以 % 隔开，如：

```javascript
encodeURI('编'); // "%E7%BC%96"
enCodeURIComponent('编'); // "%E7%BC%96"
```

### [Base64 编码](https://zh.wikipedia.org/wiki/Base64)

Base64 编码简单的来说是加密，虽说能解密，但达到肉眼不可辨认的程度

如若是基于 UTF-8 进行 Base64 编码，可以看以下的例子：

1. 编 的 UTF-8 编码转换为二进制为 11100111 10111100 10010110

1. Base64 编码是以四个单元表示三个字节，所以 编 的二进制编码重新分割为 111001 111011 110010 010110

1. 对应的十进制索引为 57 59 50 22

1. 查 Base64 索引表得到 5 7 y W，则编的 Base64 编码为 57yW

如果字符的字节数不能被 3 整除，则先使用 0 在尾部补足位数，使其被三整除，后再按照上述方法操作，在编码后加上一个或者两个 “=” 表示补足的字节数

如： E (U+0045)

1. E 是一个字节，需要补两个字节才能被编码为完整的 Base64，二进制为 01000101 00000000 00000000

1. Base64 分割 010001 010000 000000 000000

1. 十进制索引为 17 16

1. 查 Base64 索引表得到 RQ ，补了两个字节，就在编码后加上两个 =，即 RQ==

atob & btoa

这两个函数是 JavaScript 中 Base64 编码解码的函数，但编码 Unicode 会出现字符越界的异常，下面有 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/btoa) 的方法

更多内容见 [Base64 encoding and decoding](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)

```javascript
bota('E'); // RQ==
atob('RQ=='); // E


function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

utf8_to_b64('编'); // "57yW"
b64_to_utf8('57yW'); // "编"

// 译者注:在js引擎内部,encodeURIComponent(str)相当于escape(unicodeToUTF8(str))
// 所以可以推导出unicodeToUTF8(str)等同于unescape(encodeURIComponent(str))
```

escape & unescape (已被弃用的方法)

```javascript
escape('😄'); // "%uD83D%uDE04"
unescape("%uD83D%uDE04"); "😄"
```

## 参考

* [codepoints](https://codepoints.net/)

* [JavaScript’s internal character encoding: UCS-2 or UTF-16?](https://mathiasbynens.be/notes/javascript-encoding)

* [Unicode and JavaScript](http://2ality.com/2013/09/javascript-unicode.html)

* [浅谈前端的 Unicode](https://www.zeroling.com/qian-tan-qian-duan-de-unicode/)