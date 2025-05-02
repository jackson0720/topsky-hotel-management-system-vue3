import { BaseFields, BaseInitialValues } from './common.entity';

export const NoticeTypeSpecificFields = {
    NUMBER: 'NoticeTypeNumber',
    NAME: 'NoticeTypeName'
  };
  
  export const NoticeTypeFields = {
    ...NoticeTypeSpecificFields,
    ...BaseFields
  };
  
  export const initialFormValues = {
    ...BaseInitialValues,
    [NoticeTypeFields.NUMBER]: null,
    [NoticeTypeFields.NAME]: '',
    modifystatus: ''
  };
  
  export const getColumns = (t) => [
    {
      title: t('message.noticeTypeNumber'),
      dataIndex: NoticeTypeFields.NUMBER,
      key: NoticeTypeFields.NUMBER,
      defaultSortOrder: 'ascend'
    },
    {
      title: t('message.noticeTypeName'),
      dataIndex: NoticeTypeFields.NAME,
      key: NoticeTypeFields.NAME
    },
    {
      title: t('message.operation'),
      key: 'operation'
    }
  ];
  
  export const getFormRules = (t) => ({
    [NoticeTypeFields.NAME]: [
      { required: true, message: t('message.pleaseInputNoticeTypeName'), trigger: 'blur' }
    ]
  });