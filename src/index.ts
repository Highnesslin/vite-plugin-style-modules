import { IPluginOptions, IPostCssModule } from './type';
import { dataToEsm } from '@rollup/pluginutils';

// css匹配规则
const cssModuleLangs = /\.(css|less|scss|stylus)/;

// 模块化css匹配规则
let cssModuleRE = /\.(css|less|scss|stylus)/,
  // css模块化后的json结构
  cssModuleJSON: undefined | string,
  // css模块化参数
  modulesOptions: IPostCssModule = {
    scopeBehaviour: 'local',
    localsConvention: 'camelCaseOnly',
  };

async function compileCSS(id: string, code: string) {
  let moduleJson;
  const postcssPlugins = [
    require('postcss-modules')({
      ...modulesOptions,
      getJSON(cssFileName: string, module: { [name: string]: string }, outputFileName: string) {
        moduleJson = module;
        if (modulesOptions && typeof modulesOptions.getJSON === 'function') {
          modulesOptions.getJSON(cssFileName, module, outputFileName);
        }
      },
    }),
  ];

  // 根据文件名获取对应的css编译器，这里本身的错误提示就很完美了，不需要人工catch
  const cssCompiler = (id.match(cssModuleLangs) as string[])[1];

  const nextCode =
    cssCompiler !== 'css'
      ? await require(cssCompiler)
          .render(code)
          .then(res => res.css)
      : code;

  const postcssResult = await require('postcss')
    .default(postcssPlugins)
    .process(nextCode, {
      to: id,
      from: id,
      map: {
        inline: false,
        annotation: false,
      },
    });

  return {
    moduleJson,
    code: postcssResult.css,
  };
}

const pluginPre = () => {
  return {
    enforce: 'pre',
    name: 'vite-plugin-transform-css-modules-pre',
    async transform(raw: string, id: string) {
      if (cssModuleRE.test(id) && !id.includes('node_modules')) {
        const { code, moduleJson } = await compileCSS(id, raw);

        // 导出模块化后的字符串给后置的插件使用
        cssModuleJSON =
          moduleJson && dataToEsm(moduleJson, { namedExports: true, preferConst: true });

        return {
          code,
          map: { mappings: '' },
        };
      }
    },
  };
};

const pluginPost = () => {
  return {
    enforce: 'post',
    name: 'vite-plugin-transform-css-modules-post',
    async transform(css: string, id: string) {
      if (cssModuleRE.test(id) && !id.includes('node_modules')) {
        let startStr = 'const css = ';
        const cssCodeStartIndex = css.indexOf(startStr);
        const cssCodeEndIndex = css.indexOf('updateStyle(id, css)');
        const cssStr = css.slice(cssCodeStartIndex + startStr.length, cssCodeEndIndex);
        const pathIdx = id.indexOf('/src/');
        const str = id.slice(pathIdx, id.length);
        return [
          `import.meta.hot = __vite__createHotContext('${str}');`,
          `import { updateStyle, removeStyle } from "/@vite/client"`,
          `const id = ${JSON.stringify(id)}`,
          `const css = ${cssStr}`,
          `updateStyle(id, css)`,
          `${cssModuleJSON || `import.meta.hot.accept()\nexport default css`}`,
          `import.meta.hot.prune(() => removeStyle(id))`,
        ].join('\n');
      }
    },
  };
};

/**
 * 可自定义文件路径的css module
 */
const vitePluginCssModule = (options?: IPluginOptions) => {
  const { path, ...rest } = options || {};

  if (path) {
    cssModuleRE = path;
  }

  if (rest) {
    modulesOptions = Object.assign({}, modulesOptions, rest);
  }

  return [pluginPre(), pluginPost()];
};

export default vitePluginCssModule;
