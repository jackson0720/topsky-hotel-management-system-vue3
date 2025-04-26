import api from '../api';

// 获取公告类型列表
export const fetchNoticeTypes = async (params) => {
  try {
    const response = await api.get('/Base/SelectAppointmentNoticeTypeAll', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 添加公告类型
export const addNoticeType = async (data) => {
  try {
    const response = await api.post('/Base/CreateAppointmentNoticeType', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 更新公告类型
export const updateNoticeType = async (data) => {
  try {
    const response = await api.post(`/Base/UpdateAppointmentNoticeType`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 删除公告类型
export const deleteNoticeType = async (data) => {
  try {
    const response = await api.post(`/Base/DeleteAppointmentNoticeType`,data);
      return response.data;
  } catch (error) {
    throw error;
  }
};
