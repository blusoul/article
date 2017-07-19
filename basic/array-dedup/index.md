# 数组去重


## hash


## ES6 Set

Set 元素的唯一性，使得

```javascript
(function() {
    const simpleArr = [1, 1, '1', '1', [2], [2],null, undefined, null, undefined, NaN, NaN];
    const arr = [1, 1, '1', '1', null, undefined, null, undefined, NaN, NaN, /\d+/, /\d+/, function name() {alert(1);}, function name() {alert(1);}, {a: 1}, {a: 1}];

    function setUnique(arr) {
        return [...new Set(arr)];
    }

    function filterUnique(arr) {
        return arr.filter(function(item,index) {
            return !arr.includes(item, index + 1);
        })
    }

    console.log(filterUniq(simpleArr));
    console.log(uniq(arr));
})();
```

## 数组的并集

```javascript
var arr = [[1,2,3,5,NaN],[3,4,5,NaN],[3,4,5,6,NaN],[4,5,6,2,NaN],[3,5,NaN]];

function intersectionArr(arr) {
   const mainArr = arr.splice(0,1)[0];
   return mainArr.filter(function(x) {
     return arr.every(function(y) {
       return y.includes(x);
     });
   });
}

intersectionArr(arr); // [5,NaN]
```