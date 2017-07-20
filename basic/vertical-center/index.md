# CSS 之垂直居中

垂直水平居中解决方案：

所用到的 HTML 代码如下

```html
<div class="test test0">
    <div class="inner">设定行高</div>
</div>
<div class="test test1">
    <div class="inner">添加伪元素</div>
</div>
<div class="test test2">
    <div class="inner">calc动态计算</div>
</div>
<div class="test test3">
    <div class="wrapper">
        <div class="inner">表格</div>
    </div>
</div>
<div class="test test4">
    <div class="inner">transform</div>
</div>
<div class="test test5">
    <div class="inner">绝对定位与负边距</div>
</div>
<div class="test test6">
    <div class="inner">绝对定位</div>
</div>
<div class="test test7">
    <div class="inner">使用 Flexbox</div>
</div>
```

基础样式，父元素设置 position: relative; 有些方案或许不是必须，其他的只是设定内容块的 width height 及修饰。

```css
.test {
    position: relative;
    float: left;
    width: 200px;
    height: 200px;
    border: 1px solid #9ca;
}

.test .inner {
    width: 100px;
    height: 50px;
    color: #fff;
    text-align: center;
    background: #caf;
}
```

## 解决方案

* 设定行高 -- 单行文字的垂直水平居中

```css
.test0 .inner {
    line-height: 50px;
    text-align: center;
}
```

* 伪元素

:before 和 :after 伪类都需要写，只写一个与伪类会有一个 3px 的空隙，不居中。inline-block 显示的子元素和 :before 伪类没有空格。

```css
.test1 {
    text-align: center;
}

.test1:before,
.test1:after {
    content: '';
    width: 0;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
}

.test1 .inner {
    display: inline-block;
    vertical-align: middle;
}
```

* calc动态计算

```css
.test2 .inner {
    position: relative;
    top: calc(50% - 25px);
    margin: 0 auto;
}
```

* 表格

```css
.test3 {
    display: table;
}

.test3 .wrapper {
    display: table-cell;
    vertical-align: middle;
}

.test3 .inner {
    margin: 0 auto;
}
```

* CSS3 transform

```css
.test4 div {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

* 绝对定位与负边距

```css
.test5 div {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -50px;
    margin-top: -25px;
}
```

* 绝对定位

```css
.test6 div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}
```

* 使用 FlexBox

```css
.test7 {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

## 效果图如下

![vertical-center](https://raw.githubusercontent.com/blusoul/article/master/basic/vertical-center/img/vertical-center.png)

## 参考

[CSS 垂直置中的七個方法](http://www.oxxostudio.tw/articles/201408/css-vertical-align.html)























## 参考
* [CSS 垂直置中的七個方法](http://www.oxxostudio.tw/articles/201502/css-vertical-align-7methods.html)
>>>>>>> 99f9fb9863ce04dc5439c2abff4d3ca7d4dd1a5c
