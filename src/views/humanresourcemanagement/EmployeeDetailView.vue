<template>
  <a-page-header 
    :title="pageTitle" 
    @back="() => router.go(-1)" 
    class="page-header"
  />
  <a-spin :spinning="loading">
    <div v-if="employeeInfo" class="detail-container">
      <a-modal
        :visible="uploadVisible"
        :footer="null"
        :closable="false"
        :maskClosable="false"
        width="400px"
        centered
      >
        <div class="upload-progress">
          <a-progress
            type="circle"
            :percent="progressPercent"
            :status="uploadStatus"
          />
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </a-modal>
      <div class="avatar-section">
          <div class="avatar-container">
            <a-upload
              name="file"
              :customRequest="customUpload"
              :showUploadList="false"
              :beforeUpload="beforeUpload"
              accept="image/*"
            >
              <a-tooltip :title="$t('message.changeAvatar')">
                <a-avatar :size="160" :src="avatarPreviewUrl || avatarUrl" class="avatar">
                  <template v-if="!avatarPreviewUrl && !avatarUrl">
                    <UserOutlined />
                  </template>
                  <template v-if="uploadLoading">
                    <LoadingOutlined />
                  </template>
                </a-avatar>
              </a-tooltip>
          </a-upload>
        </div>
        
        <h2 class="employee-name">{{ employeeInfo[EmployeeFields.NAME] }}</h2>
        <div class="position-info">
          {{ employeeInfo[EmployeeFields.DEPARTMENTNAME] }} - {{ employeeInfo[EmployeeFields.POSITIONNAME] }}
        </div>
      </div>

      <div class="info-sections">
        <a-card :title="$t('message.basicInfo')" class="info-card">
          <a-descriptions bordered :column="2">
            <a-descriptions-item :label="$t('message.staffId')">
              {{ employeeInfo[EmployeeFields.NUMBER] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.gender')">
              {{ employeeInfo[EmployeeFields.GENDERNAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffBirthday')">
              {{ formatDate(employeeInfo[EmployeeFields.DATEOFBIRTH]) }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffNation')">
              {{ employeeInfo[EmployeeFields.ETHNICITYNAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffEducation')">
              {{ employeeInfo[EmployeeFields.EDUCATIONLEVELNAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffFace')">
              {{ employeeInfo[EmployeeFields.POLITICALAFFILIATIONNAME] }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :title="$t('message.contactInfo')" class="info-card">
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="$t('message.staffTel')">
              {{ employeeInfo[EmployeeFields.PHONENUMBER] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffEmailAddress')">
              {{ employeeInfo[EmployeeFields.EMAILADDRESS] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffAddress')">
              {{ employeeInfo[EmployeeFields.ADDRESS] }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :title="$t('message.employmentInfo')" class="info-card">
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="$t('message.staffTime')">
              {{ formatDate(employeeInfo[EmployeeFields.HIREDATE]) }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffDepartment')">
              {{ employeeInfo[EmployeeFields.DEPARTMENTNAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffPosition')">
              {{ employeeInfo[EmployeeFields.POSITIONNAME] }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :title="$t('message.personalInfo')" class="info-card">
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="$t('message.staffName')">
              {{ employeeInfo[EmployeeFields.NAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffCardType')">
              {{ employeeInfo[EmployeeFields.IDCARDTYPENAME] }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('message.staffCardID')">
              {{ employeeInfo[EmployeeFields.IDCARDNUMBER] }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :title="$t('message.rewardPunishmentInfo')" class="info-card">
          <template #extra>
            <a @click="showMoreModal('reward')" @keydown.enter="showMoreModal('reward')" role="button">{{ $t('message.more') }}</a>
          </template>
          <a-table 
            :data-source="workRewardPunishment" 
            :columns="rewardPunishmentFilterColumns" 
            :rowKey="record => record.Id"
            :pagination="false"
          >
          <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === EmployeeRewardPunishmentFields.TYPE">
                <div class="tag">
                  <a-tag :color="record[EmployeeRewardPunishmentFields.TYPE] === 1 ? 'green' : 'red'">{{ record[EmployeeRewardPunishmentFields.TYPENAME] }}</a-tag>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card :title="$t('message.checkInfo')" class="info-card">
          <template #extra>
            <a @click="showMoreModal('check')" @keydown.enter="showMoreModal('check')" role="button">{{ $t('message.more') }}</a>
          </template>
          <a-table 
            :data-source="workCheckInfo" 
            :columns="checkFilterColumns" 
            :rowKey="record => record.Id"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === EmployeeCheckFields.CHECKSTATUS">
                <div class="tag">
                  <a-tag :color="record[EmployeeCheckFields.CHECKSTATUS] == 0 ? 'green' : 'red'">{{ record[EmployeeCheckFields.CHECKSTATUS] == 0 ? "成功" : "失败" }}</a-tag>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card :title="$t('message.workHistory')" class="info-card">
          <a-table 
            :data-source="workHistory" 
            :columns="historyFilterColumns" 
            :rowKey="record => record.Id"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === EmployeeHistoryFields.POSITION">
                <div class="tag">
                  <a-tag color="blue">{{ record[EmployeeHistoryFields.POSITION] }}</a-tag>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-modal
        v-model:open="showModal"
        :title="modalTitle"
        width="80%"
        :footer="null"
        destroyOnClose
        :keyboard="false"
        :focusTriggerAfterClose="true"
        :autofocus="false"
        :forceRender="false"
        wrapClassName="accessible-modal"
      >
        <a-spin :spinning="modalLoading">
          <a-table
            :columns="modalColumns"
            :data-source="modalData"
            :rowKey="record => record.Id"
            :pagination="modalPagination"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="currentDataType === 'reward' && column.key === EmployeeRewardPunishmentFields.TYPE">
                <a-tag :color="record[EmployeeRewardPunishmentFields.TYPE] == 1 ? 'green' : 'red'">
                  {{ record[EmployeeRewardPunishmentFields.TYPE] == 1 ? "奖励" : "惩罚" }}
                </a-tag>
              </template>
              
              <template v-if="currentDataType === 'check' && column.dataIndex === EmployeeCheckFields.CHECKSTATUS">
                <a-tag :color="record[EmployeeCheckFields.CHECKSTATUS] == 0 ? 'green' : 'red'">
                  {{ record[EmployeeCheckFields.CHECKSTATUS] == 0 ? "成功" : "失败" }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-spin>
      </a-modal>

      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted, computed, nextTick  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchEmployeeDetail, fetchEmployeeResume, fetchEmployeeRewardPunishment, fetchEmployeeAttendance, uploadEmployeeAvatar } from '@/api/employeeapi';
import { 
  EmployeeFields
} from '@/entities/employee.entity';
import { EmployeeHistoryFields, getHistoryColumns } from '@/entities/employeehistory.entity';
import { EmployeeRewardPunishmentFields, getRewardPunishmentColumns } from '@/entities/rewardpunishment.entity';
import { EmployeeCheckFields, getCheckColumns } from '@/entities/employeecheck.entity';
import { useI18n } from 'vue-i18n';
import { formatDate, showErrorNotification, showSuccessNotification } from '@/utils';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const employeeId = route.params.employeeId;
const employeeInfo = ref(null);
const workHistory = ref([]);
const workRewardPunishment = ref([]);
const workCheckInfo = ref([]);
const loading = ref(true);
const avatarUrl = ref([]);

const avatarPreviewUrl = ref('');
const uploadLoading = ref(false);
const uploadVisible = ref(false);
const progressPercent = ref(0);
const uploadStatus = ref('active');
const progressText = ref(t('message.uploading'));

const pageTitle = ref(t('message.employeeDetail'));

const showModal = ref(false);
const currentDataType = ref('');
const modalData = ref([]);
const modalLoading = ref(false);
const modalPagination = ref({
  current: 1,
  pageSize: 15,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['15', '30', '50'],
  showTotal: total => t('message.totalRecords', { total })
});

const modalTitle = computed(() => {
  return currentDataType.value === 'reward' 
    ? t('message.rewardPunishmentInfo')
    : t('message.checkInfo');
});

const customUpload = async ({ file, onProgress, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('EmployeeId', employeeId);

  try {

    uploadVisible.value = true;
    progressPercent.value = 0;
    uploadStatus.value = 'active';
    progressText.value = t('message.uploading');
    const response = await uploadEmployeeAvatar(formData,{
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        progressPercent.value = Math.min(percent, 99);
      }
    });

    progressPercent.value = 100;
    progressText.value = t('message.uploadSuccess');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (response?.StatusCode === 200) {
      uploadStatus.value = 'success';
      showSuccessNotification(t('message.avatarUpdateSuccess'));
      avatarUrl.value = response.Source.PhotoPath;
      avatarPreviewUrl.value = '';
      onSuccess(response, file);
    } else {
      throw new Error(response?.message || t('message.uploadFailed'));
    }
  } catch (error) {
    uploadStatus.value = 'exception';
    progressText.value = t('message.uploadFailed');
    showErrorNotification(error.message);
    onError(error);
  } finally {
    setTimeout(() => {
      uploadVisible.value = false;
      progressPercent.value = 0;
    }, 1500);
  }
};

const beforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      showErrorNotification(t('message.uploadImageOnly'));
      return reject(false);
    }

    if (file.size / 1024 / 1024 > 2) {
      showErrorNotification(t('message.imageSizeLimit'));
      return reject(false);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      avatarPreviewUrl.value = reader.result;
      resolve(true);
    };
    reader.onerror = error => reject(error);
  });
};

const showMoreModal = async (type) => {
  currentDataType.value = type;
  showModal.value = true;
  await nextTick();
  const modalTitle = document.querySelector('.ant-modal-title');
  if (modalTitle) {
    modalTitle.setAttribute('tabindex', '-1');
    modalTitle.focus();
  }
  await loadModalData();
};

const loadModalData = async () => {
  try {
    modalLoading.value = true;
    const params = {
      [EmployeeFields.NUMBER]: employeeId,
      Page: modalPagination.value.current,
      PageSize: modalPagination.value.pageSize,
    };

    let response;
    if (currentDataType.value === 'reward') {
      response = await fetchEmployeeRewardPunishment(params);
    } else {
      response = await fetchEmployeeAttendance(params);
    }

    if (response?.listSource) {
      modalData.value = response.listSource;
      modalPagination.value.total = response.total || 0;
    }
  } finally {
    modalLoading.value = false;
  }
};

const handleTableChange = (pag) => {
  modalPagination.value = {
    ...modalPagination.value,
    current: pag.current,
    pageSize: pag.pageSize,
  };
  loadModalData();
};

const modalColumns = computed(() => {
  return currentDataType.value === 'reward' 
    ? rewardPunishmentFilterColumns.value
    : checkFilterColumns.value;
});

const historyColumns = computed(() => getHistoryColumns(t));
const historyFilterColumns = computed(() => historyColumns.value.filter(column => !column.hidden));

const rewardPunishmentColumns = computed(() => getRewardPunishmentColumns(t));
const rewardPunishmentFilterColumns = computed(() => rewardPunishmentColumns.value.filter(column => !column.hidden));

const checkColumns = computed(() => getCheckColumns(t));
const checkFilterColumns = computed(() => checkColumns.value.filter(column => !column.hidden));

const loadData = async () => {
  try {
    const infoRes = await fetchEmployeeDetail({ 
      [EmployeeFields.NUMBER]: employeeId 
    });
    
    if (infoRes?.Source) {
      employeeInfo.value = infoRes.Source;
      pageTitle.value = `${t('message.employeeDetail')} - ${employeeInfo.value[EmployeeFields.NUMBER]}`;
      
      if (employeeInfo.value.PhotoUrl) {
        avatarUrl.value = employeeInfo.value.PhotoUrl;
      }
    }

    const historyRes = await fetchEmployeeResume({ 
      [EmployeeFields.NUMBER]: employeeId 
    });
    
    if (historyRes?.listSource) {
      workHistory.value = historyRes.listSource.map(item => ({
        ...item,
        DateRange: `${formatDate(item.StartDate)} - ${formatDate(item.EndDate)}`
      }));
    }

    const rewardPunishmentRes = await fetchEmployeeRewardPunishment({ 
      [EmployeeFields.NUMBER]: employeeId,
      Page: 1,
      PageSize: 3 
    });
    
    if (rewardPunishmentRes?.listSource) {
      workRewardPunishment.value = rewardPunishmentRes.listSource.map(item => ({
        ...item
      }));
    }

    const attendanceRes = await fetchEmployeeAttendance({ 
      [EmployeeFields.NUMBER]: employeeId,
      Page: 1,
      PageSize: 3
    });

    if(attendanceRes?.listSource) {
      workCheckInfo.value = attendanceRes.listSource.map(item => ({
        ...item
      }));
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.page-header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.upload-progress {
  text-align: center;
  padding: 20px;

  :deep(.ant-progress-circle) {
    margin-bottom: 16px;
  }

  .progress-text {
    margin-top: 8px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
  }
}

.avatar-section .ant-upload-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.avatar-section .ant-upload-disabled:hover::after {
  display: none;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-container .ant-upload {
  display: block !important;
  margin: 0 auto;
}

.avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.employee-name {
  margin: 8px 0;
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
}

.position-info {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
}

.info-sections {
  display: grid;
  gap: 24px;
}

.info-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.tag {
  display: inline-block;
  margin: 2px 0;
}

@media (min-width: 768px) {
  .info-sections {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-card:last-child {
    grid-column: 1 / -1;
  }
}


.page-header :deep(.ant-page-header-heading-title) {
  font-size: 18px;
}

.info-card :deep(.ant-card-extra) {
  margin-left: 10px;
}

.info-card :deep(.ant-card-extra) a {
  color: #1890ff;
}

.accessible-modal :deep(.ant-modal-wrap[aria-hidden="true"]) {
  pointer-events: none;
  visibility: hidden;
}

.accessible-modal :deep(.ant-modal-wrap[aria-hidden="true"] *) {
  visibility: hidden !important;
}
</style>