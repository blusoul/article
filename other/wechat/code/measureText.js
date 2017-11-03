// 文字宽度数据，以 10 px 为基础
const measureData = { "0": 5.8642578125, "1": 5.8642578125, "2": 5.8642578125, "3": 5.8642578125, "4": 5.8642578125, "5": 5.8642578125, "6": 5.8642578125, "7": 5.8642578125, "8": 5.8642578125, "9": 5.8642578125, "a": 5.52734375, "b": 6.38671875, "c": 5.0146484375, "d": 6.396484375, "e": 5.673828125, "f": 3.466796875, "g": 6.396484375, "h": 6.1572265625, "i": 2.6611328125, "k": 5.4443359375, "l": 2.6611328125, "m": 9.3701171875, "n": 6.162109375, "o": 6.357421875, "p": 6.38671875, "q": 6.396484375, "r": 3.818359375, "s": 4.62890625, "t": 3.7255859375, "u": 6.162109375, "v": 5.2490234375, "w": 7.8955078125, "x": 5.068359375, "y": 5.29296875, "z": 4.9169921875, "A": 7.0361328125, "B": 6.2744140625, "C": 6.689453125, "D": 7.6171875, "E": 5.498046875, "F": 5.3125, "G": 7.4365234375, "H": 7.734375, "I": 2.939453125, "J": 3.9599609375, "K": 6.34765625, "L": 5.1318359375, "M": 9.7705078125, "N": 8.1298828125, "O": 8.1494140625, "P": 6.1181640625, "Q": 8.1494140625, "R": 6.5283203125, "S": 5.771484375, "T": 5.732421875, "U": 7.4658203125, "V": 6.7626953125, "W": 10.17578125, "X": 6.4501953125, "Y": 6.03515625, "Z": 6.201171875, ",": 2.4072265625, ".": 2.4072265625, "/": 4.2724609375, "<": 7.4169921875, ">": 7.4169921875, "?": 4.8291015625, ":": 2.4072265625, "\"": 4.35546875, ";": 2.4072265625, "{": 3.33984375, "}": 3.33984375, "[": 3.33984375, "]": 3.33984375, "\\": 4.16015625, "|": 2.6904296875, " ": 2.958984375, "`": 2.94921875, "~": 7.4169921875, "!": 3.125, "@": 10.3125, "#": 6.3818359375, "$": 5.8642578125, "%": 8.896484375, "^": 7.4169921875, "&": 8.701171875, "*": 4.55078125, "(": 3.33984375, ")": 3.33984375, "_": 4.482421875, "+": 7.4169921875, "-": 4.326171875, "=": 7.4169921875, "'": 2.5634765625, "…": 8.134765625, "—": 10.80078125 }

// 非换行处正则
const wrapReg = /^\w|'|:$/

/**
 * 文本分段函数
 * {object} 参数 
 * {string} params.str 需要操作的字符串
 * {number} params.limitWidth 行限定的宽度
 * {number} params.fontSize 字体大小
 * {boolean} params.isTextIndent 是否首行缩进两个字符
 */
export function measureText({ str, limitWidth = 640, fontSize = 16, isTextIndent = false } = data) {
  
  if (!(typeof str == 'string' && str.length)) {
    throw new Error('string must be a string')
  };
  
  if (!(typeof limitWidth == 'number' && limitWidth > 0)) {
    throw new Error('string must has limit width, such as a positive number')
  }
  
  if (!(typeof fontSize == 'number' && fontSize > 0)) {
    throw new Error('string must has fontSize, such as a positive number')
  }

  if (typeof isTextIndent != 'boolean') {
    throw new Error('isTextIndent must be a boolean')
  }

  let originList = str.split('')
  let result = []

  function loopStr(arr) {
    let start = 0
    let end = 0
    let width = 0

    // 正常换行处
    let wrapIndex = 0

    for (var i = 0, len = arr.length; i < len; i++) {
      if (!arr.length) return false

      const item = arr[i]
      const itemWidth = (measureData[item] || 10) * fontSize / 10

      width += itemWidth

      // 换行处字符索引暂存
      if (!wrapReg.test(item)) {
        wrapIndex = i
      }

      //  总字符宽度小于设定宽度 (第一行行首空两个字的距离)
      if (width < (isTextIndent && result.length == 0 ? (limitWidth - 2 * fontSize) : limitWidth)) {
        if (i < len - 1) continue

        // 最后不足一行
        result.push(arr.splice(0).join(''))
        return result
      }

      // 超出限定宽度，从前一个字符换行
      end = i - 1

      // 当前字符和下个字符都是字幕或者数字，需要从前面的非字母数字处换行
      if (wrapReg.test(item) && wrapReg.test(arr[end])) {
        end = wrapIndex
      }

      result.push(arr.splice(start, end + 1).join(''))
      break
    }

    // 递归调用
    return loopStr(arr)
  }

  loopStr(originList)
  return result
}
