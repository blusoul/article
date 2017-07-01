# 匿名函数 & 命名函数 & 立即执行函数 （未完成）

## 函数定义

## 函数声明

## 函数表达式

### 匿名函数表达式

### 命名函数表达式

```javascript
var sayHello = function sayHello() {
  console.log(sayHello);
};
```

命名函数表达式标识符，仅在函数内部有作用，但在 IE8 以及以下的浏览器中，JScript 不按规范来，在函数所在的作用域中都可以访问，因此导致某些代码压缩工具在不使用支持 IE8 的配置时，混淆变量名造成的所有的命名函数标识符都相同，因此函数调用出错。

在 webpack 中开发模式 Babel 打包中对所有匿名函数都转换为命名函数表达式，以方便在开发过程中调试，生产环境压缩时，不会使用命名函数，代码混淆压缩后，调试的便利就变得不重要了。

命名函数表达式比匿名函数表达式相比，具有以下优点：

1 调试

### 立即执行函数表达式

```javascript
var a = 2;
(function IIFE(global, undefined) {
  var a = 3;
  console.log(a, global.a);
})(window);
```

### 倒置代码的运行顺序，将需要运行的函数放在第二位。这种模式在 UMD （Universal Module Definition） 中被广泛应用。

```javascript
var a = 2;
(function IIFE(def) {
  def(window);
})(function(global){
  var a = 3;
  console.log(a, global.a);
});
```

参考：

* [IE6 IE7 IE8 的函数声明和函数表达式的实现与其他浏览器有差异](http://w3help.org/zh-cn/causes/SJ9001)

* [Named function expressions demystified（命名函数表达式揭秘英文版）](https://kangax.github.io/nfe/)

* [命名函数表达式揭秘](http://justjavac.com/named-function-expressions-demystified.html#jscript-bugs)

* [JavaScript 匿名函数有哪几种执行方式?](https://www.zhihu.com/question/20249179)

* [babel online](http://babeljs.io/repl/)