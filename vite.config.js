import { defineConfig, loadEnv } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    assetsInclude: ['​**​/*.woff', '​**​/*.woff2'],
    plugins: [
      vue(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            resolveIcons: true,
            importStyle: false,
            importStyleTheme: path.resolve(__dirname, "src/styles/antd.less")
          })
        ],
        dts: mode === 'development',
        include: [/\.vue$/, /\.vue\?vue/]
      }),
      commonjs({
        include: /node_modules\/dayjs/,
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'ant-design-vue/es': 'ant-design-vue/es',
        '~fonts': path.resolve(__dirname, 'src/assets/fonts')
      }
    },
    optimizeDeps: {
      exclude: ['ant-design-vue/es'],
      include: ['lodash-es', 'dayjs/plugin/advancedFormat', 'dayjs/plugin/customParseFormat',
         'dayjs/plugin/customParseFormat','dayjs/plugin/weekday','dayjs/plugin/localeData','dayjs/plugin/weekday','dayjs/plugin/quarterOfYear','dayjs/plugin/weekOfYear','dayjs/plugin/weekYear']
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'primary-color': '#1890ff',
            'border-radius-base': '4px',
            'font-family': "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          },
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, 'src/styles/antd.less')}";`
        }
      }
    },
    build: {
      assetsDir: 'assets/fonts',
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (/\.(woff|woff2)$/.test(assetInfo.name)) {
              return 'assets/fonts/[name][extname]'
            }
            return 'assets/[name][extname]'
          }
        }
      }
    },
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    }
  };
});