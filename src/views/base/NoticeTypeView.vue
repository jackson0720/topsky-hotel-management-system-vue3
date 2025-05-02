<template>
    <div>
      <h1 style="margin-bottom: 15px;">{{ translatedPageTitle }}</h1>
      <a-button @click="refreshData" style="margin-bottom: 15px;margin-right: 15px;"><sync-outlined /> {{ $t('message.refreshData') }}</a-button>
      <a-button type="primary" @click="showModal" style="margin-bottom: 15px;"><plus-outlined /> {{ $t('message.insertNoticeType') }}</a-button>
      <a-table :columns="columns" :data-source="notices" :loading="loading" :pagination="pagination" @change="handleTableChange" @sorterChange="handleSorterChange" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-button @click="editNoticeType(record)" style="margin-right: 15px;"><edit-outlined /> {{ $t('message.edit') }}</a-button>
              <a-popconfirm :title="t('message.areYouSureToDeleteRecord')" @confirm="handleDelete(record)">
              <a-button danger><delete-outlined /> {{ $t('message.delete') }}</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
  
      <a-modal :open="modalVisible" :title="modalTitle" @ok="handleModalOk" @cancel="handleModalCancel" :confirm-loading="confirmLoading">
        <a-form :model="form" :rules="rules" ref="formRef">
          <a-form-item :label="noticeTypeNoLabel" :name="NoticeTypeFields.NUMBER">
            <a-input v-model:value="form[NoticeTypeFields.NUMBER]" type="hidden" />
            <span>{{ form[NoticeTypeFields.NUMBER] }}</span>
          </a-form-item>
          <a-form-item :label="noticeTypeNameLabel" :name="NoticeTypeFields.NAME">
            <a-input v-model:value="form[NoticeTypeFields.NAME]" />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, reactive } from 'vue';
  import { useRoute } from 'vue-router';
  import { getPageTitle } from '@/utils/pageTitle';
  import { showErrorNotification, showSuccessNotification } from '@/utils/index';
  import { fetchNoticeTypes, addNoticeType, updateNoticeType, deleteNoticeType } from '@/api/noticetypeapi';
  import { 
    NoticeTypeFields, 
    initialFormValues, 
    getColumns, 
    getFormRules 
  } from '@/entities/noticetype.entity';
  import { useI18n } from 'vue-i18n';
  import generateSnowflakeId from '@/utils/snowflake';
  
  const { t } = useI18n();
  const route = useRoute();
  const pageTitleKey = computed(() => getPageTitle(route.path));
  const translatedPageTitle = computed(() => t(pageTitleKey.value));
  const loading = ref(false);
  const notices = ref([]);
  const modalVisible = ref(false);
  const modalTitle = ref('');
  const confirmLoading = ref(false);
  const formRef = ref(null);
  const sortedInfo = ref({ order: null, columnKey: null });
  
  const form = reactive({ ...initialFormValues });
  
  const rules = getFormRules(t);
  
  const noticeTypeNoLabel = computed(() => t('message.noticeTypeNumber'));
  const noticeTypeNameLabel = computed(() => t('message.noticeTypeName'));
  
  const columns = computed(() => getColumns(t));
  
  const pagination = reactive({
      current: 1,
      pageSize: 15,
      total: 0,
      showSizeChanger: true,
      pageSizeOptions: ['15', '30', '50'],
      showTotal: total => t('message.totalRecords', { total })
    });
  
  const fetchNoticeTypeData = async () => {
    loading.value = true;
    try {
      const result = await fetchNoticeTypes({
        page: pagination.current,
        pageSize: pagination.pageSize, 
        [NoticeTypeFields.IS_DELETED]: 0
      });
      if (result?.listSource) {
        notices.value = result.listSource.map(item => ({
        [NoticeTypeFields.ID]: item[NoticeTypeFields.ID],
        [NoticeTypeFields.NUMBER]: item[NoticeTypeFields.NUMBER],
        [NoticeTypeFields.NAME]: item[NoticeTypeFields.NAME],
        [NoticeTypeFields.IS_DELETED]: item[NoticeTypeFields.IS_DELETED]
      }));
      pagination.total = result.total;
      } else {
        showErrorNotification('数据格式错误');
      }
    } catch (error) {
      showErrorNotification(error.message || t('message.pleaseTryAgainLater'));
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    fetchNoticeTypeData();
  });
  
  const showModal = () => {
    modalVisible.value = true;
    modalTitle.value = t('message.insertNoticeType');
    form[NoticeTypeFields.NUMBER] = generateSnowflakeId({
      prefix: 'NT-',
      separator: null,
    });
    form[NoticeTypeFields.NAME] = '';
    form.modifystatus = 'insert';
  };
  
  const refreshData = () => 
  {
    fetchNoticeTypeData();
  };
  
  const editNoticeType = (record) => {
    modalVisible.value = true;
    modalTitle.value = t('message.updateNoticeType');
    form[NoticeTypeFields.ID] = record[NoticeTypeFields.ID];
    form[NoticeTypeFields.NUMBER] = record[NoticeTypeFields.NUMBER];
    form[NoticeTypeFields.NAME] = record[NoticeTypeFields.NAME];
    form.modifystatus = 'update';
  };
  
  const handleModalOk = async () => {
    try {
      await formRef.value.validate();
      confirmLoading.value = true;
      if (form.modifystatus === 'update') {
        var response = await updateNoticeType({ ...form});
        if(response && response.StatusCode === 200)
        {
          showSuccessNotification(t('message.updateSuccess'));
        }
        else
        {
          showErrorNotification(response.Message);        
        }
      } else {
        var response = await addNoticeType({ ...form});
        if(response && response.StatusCode === 200)
        {
          showSuccessNotification(t('message.addSuccess'));
        }
        else
        {
          showErrorNotification(response.Message);        
        }
      }
      modalVisible.value = false;
      fetchNoticeTypeData();
    } catch (error) {
      showErrorNotification(t('message.pleaseTryAgainLater'));
    } finally {
      confirmLoading.value = false;
    }
  };
  
  const handleModalCancel = () => {
    modalVisible.value = false;
  };
  
  const handleDelete = async (record) => {
    try {
      record[NoticeTypeFields.IS_DELETED] = 1;
      var response = await deleteNoticeType(record);
      if(response && response.StatusCode === 200)
      {
        showSuccessNotification(t('message.deleteSuccess'));
      }
      else
      {
        showErrorNotification(response.Message);        
      }
      fetchNoticeTypeData();
    } catch (error) {
      showErrorNotification(t('message.pleaseTryAgainLater'));
    }
  };
  
  const handleTableChange = (newPagipassport) => {
    pagipassport.current = newPagipassport.current;
    pagipassport.pageSize = newPagipassport.pageSize;
    fetchNoticeTypeData();
  };
  
  const handleSorterChange = (pagipassport, filters, sorter) => {
    sortedInfo.value = sorter;
  };
  </script>