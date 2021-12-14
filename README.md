# vite-plugin-style-modules

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

| Name                              | Type                                                            | Description                                     | 默认                            |
| --------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| path                              | RegExp                                                          | 需要模块化处理的文件名正则表达式，比如`/\.css/` | `/\.(css\|less\|scss\|stylus)/` |
| **postcss-modules**接收的参数 | [postcss-modules](https://github.com/madyankin/postcss-modules) | 参数将直接透传到 **postcss-modules**            | `undefined`                            |

### 特性

内置`css`、`less`、`sass`、`stylus`，不需要额外安装