# vite-plugin-style-modules

## 版本

Vite2.7.4 及以上

## 安装

```javascript
npm install vite-plugin-style-modules
```

## demo

**vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCssModule from 'vite-plugin-style-modules';
// 支持ESM和CommonJS两种方式引入
// const viteCssModule = require('vite-plugin-style-modules')

export default defineConfig({
  plugins: [react(), viteCssModule()],
});
```

**LESS 文件**

```css
:global {
  #root {
    margin: 0;
    padding: 0;
  }

  h1 {
    color: #0af;
    font-style: italic;
  }

  .child {
    border: 1px solid;
  }
}

.wrapper {
  color: #0af;
  .title {
    font-size: 16px;
  }
}
```

组件

```jsx
import ReactDOM from 'react-dom';
import styles from './index.less';

console.log('styles', styles);

ReactDOM.render(
  <div className={styles.wrapper}>
    <h1 className='child'>123</h1>
  </div>,
  document.querySelector('#root')
);
```

## API

`vite-plugin-style-modules`允许接受一个对象作为参数，详情如下：

| Name                          | Type                                                            | Description                                     | 默认                                  |
| ----------------------------- | --------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| path                          | RegExp                                                          | 需要模块化处理的文件名正则表达式，比如`/\.css/` | `/\.(css\|less\|scss\|stylus\|styl)/` |
| **postcss-modules**接收的参数 | [postcss-modules](https://github.com/madyankin/postcss-modules) | 参数将直接透传到 **postcss-modules**            | `undefined`                           |

### 其他

#### 1、预处理语言

支持`less`、`sass`、`stylus`，使用前需要安装对应的**postcss 插件**，比如`postcss-less`

#### 2、支持`@import url`

#### 3、Of course, 支持热更新

一个合格的 vite 插件应该都会具有哈

### 待完成

生产环境打包
