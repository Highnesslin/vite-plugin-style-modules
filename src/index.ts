import { IPluginOptions, IPostCssModule } from './type';
import { dataToEsm } from '@rollup/pluginutils';

// css匹配规则
const cssLangs = /\.(css|less|scss|stylus|styl)/;

// 模块化css匹配规则
let cssModuleLangs = /\.(css|less|scss|stylus|styl)/,
  // css模块化后的json结构
  cssModuleJSON: undefined | string,
  // css模块化参数
  modulesOptions: IPostCssModule = {
    scopeBehaviour: 'local',
    localsConvention: 'camelCase',
  },
  postcssPlugins = [
    require('postcss-nested')(),
  ];

async function compileCSS(id: string, code: string) {
  let moduleJson;
  const _postcssPlugins = [
    ...postcssPlugins,
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
  const lang = (id.match(cssLangs) as string[])[1];
  const parser = lang !== 'css' ? require(`postcss-${lang}`) : undefined;

  const nextCode = await require('postcss')
    .default(_postcssPlugins)
    .process(code, {
      parser,
      to: id,
      from: id,
      map: {
        inline: false,
        annotation: false,
      },
    })
    .then(res => res.css);

  return {
    moduleJson,
    code: nextCode,
  };
}

const pluginPre = () => {
  return {
    enforce: 'pre',
    name: 'vite-plugin-transform-css-modules-pre',
    configResolved(_config) {
      if (!_config || !_config.css) return;

      if (_config.css.modules) {
        const { modules } = _config.css;
        modulesOptions = Object.assign({}, modulesOptions, modules);
      }

      if (_config.css.postcss && _config.css.postcss.plugins) {
        const { plugins } = _config.css.postcss;
        if (Array.isArray(plugins)) {
          postcssPlugins.push(...(plugins as Array<never>));
        } else {
          console.error('配置项 [css.postcss] 必须是数组类型');
        }
      }
    },
    async transform(raw: string, id: string) {
      if (cssModuleLangs.test(id) && !id.includes('node_modules')) {
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
      if (cssModuleLangs.test(id) && !id.includes('node_modules')) {
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
          cssModuleJSON
            ? `${cssModuleJSON}` + `import.meta.hot.accept('${str}')`
            : 'import.meta.hot.accept()' + 'export default css',
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
    cssModuleLangs = path;
  }

  if (rest) {
    modulesOptions = Object.assign({}, modulesOptions, rest);
  }

  return [pluginPre(), pluginPost()];
};

export default vitePluginCssModule;
