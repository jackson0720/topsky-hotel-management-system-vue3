import { defineConfig, loadEnv } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
        'ant-design-vue/es': 'ant-design-vue/es'
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
          additionalData: `
          @import "${path.resolve(__dirname, 'src/styles/antd.less')}";
          `
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'NotoSans-Regular.woff') {
              return 'assets/fonts/NotoSans-Regular.woff';
            }
            if (assetInfo.name === 'NotoSans-Regular.woff2') {
              return 'assets/fonts/NotoSans-Regular.woff2';
            }
            return 'assets/[name][extname]';
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