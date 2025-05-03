<template>
  <ConfigProvider :locale="antdLocale">
    <GlobalNotification />
    <router-view v-if="isRouterAlive" />
  </ConfigProvider>
</template>

<script setup>
import { onMounted, ref, watch, provide, nextTick } from 'vue';
import { showErrorNotification,showInfoNotification,showSuccessNotification,showWarningNotification } from './utils/index.js';
import GlobalNotification from './components/GlobalNotification.vue';
import { checkTokenValidity } from './utils/auth';
import { useI18n } from 'vue-i18n';
import { ConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

const { locale } = useI18n();
const antdLocale = ref(zhCN);
const isRouterAlive = ref(true);

const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
};
provide('reload', reload);

const updateDayjsLocale = (lang) => {
  dayjs.locale(lang === 'zh-CN' ? 'zh-cn' : 'en');
};

const generateAntdLocale = (lang) => {
  updateDayjsLocale(lang);
  return lang === 'zh-CN' ? zhCN : enUS;
};

watch(
  () => locale.value,
  (newLocale) => {
    antdLocale.value = generateAntdLocale(newLocale);
  },
  { immediate: true }
);

onMounted(() => {
  window.$notification = showInfoNotification;
  checkTokenValidity();
});
</script>

<style>
#app {
  font-weight: 500;
}

.ant-modal-title,
.ant-tabs-tab,
.ant-form-item-label > label {
  font-family: inherit !important;
  font-weight: inherit !important;
}

.ant-table-cell {
  vertical-align: middle !important;
}
</style>