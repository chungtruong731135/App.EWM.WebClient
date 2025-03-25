import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  random: null,
  dataModal: null,
  data2Modal: null,

  modalExamState: {
    modalVisible: false,
    type: null,
    modalData: null,
  },
  modalExamSkillState: {
    modalVisible: false,
    type: null,
    modalData: null,
  },
  modalExamPartState: {
    modalVisible: false,
    type: null,
    modalData: null,
  },

  modalExamVariationState: {
    modalVisible: false,
    type: null,
    modalData: null,
  },

  drawerData: {
    drawerVisible: false,
    drawerData: null,
  },

  currentVariation: null,

  refreshSkill: null,
  refreshPart: null,

  courseDetail: null,
  courseDetailModalVisible: false,

  topicDetail: null,
  topicDetailModalVisible: false,

  questionLevelDetail: null,
  questionLevelDetailModalVisible: false,

  questionLevelItemDetail: null,
  questionLevelItemDetailModalVisible: false,

  courseOnlineDetail: null,
  courseOnlineDetailModalVisible: false,

  courseOnlineClassDetail: null,
  courseOnlineClassDetailModalVisible: false,

  courseOnlineClassSessionDetail: null,
  courseOnlineClassSessionDetailModalVisible: false,
  autoCourseOnlineClassSessionDetailModalVisible: false,

  modalVisible: false,
  modal2Visible: false,
  dataSearch: null,
  listLoading: false,
  actionsLoading: false,
  error: null,
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState: initialState,
  reducers: {
    catchError: (state, action) => {
      state.error = `${action.type}: ${action.payload.error}`;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = false;
      } else {
        state.actionsLoading = false;
      }
    },
    startCall: (state, action) => {
      state.error = null;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = true;
      } else {
        state.actionsLoading = true;
      }
    },

    setDataModal: (state, action) => {
      const payload = action.payload;
      state.dataModal = payload;
    },

    setModalVisible: (state, action) => {
      const payload = action.payload;
      state.modalVisible = payload;
      if (!state.modalVisible) {
        state.dataModal = null;
      }
    },

    setData2Modal: (state, action) => {
      const payload = action.payload;
      state.data2Modal = payload;
    },

    setModal2Visible: (state, action) => {
      const payload = action.payload;
      state.modal2Visible = payload;
      if (!state.modal2Visible) {
        state.data2Modal = null;
      }
    },

    setCourseDetail: (state, action) => {
      const payload = action.payload;
      state.courseDetail = payload;
    },

    setCourseDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.courseDetailModalVisible = payload;
      if (!state.courseDetailModalVisible) {
        state.courseDetail = null;
      }
    },

    setCourseOnlineDetail: (state, action) => {
      const payload = action.payload;
      state.courseOnlineDetail = payload;
    },

    setCourseOnlineDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.courseOnlineDetailModalVisible = payload;
      if (!state.courseOnlineDetailModalVisible) {
        state.courseOnlineDetail = null;
      }
    },

    setCourseOnlineClassDetail: (state, action) => {
      const payload = action.payload;
      state.courseOnlineClassDetail = payload;
    },

    setCourseOnlineClassDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.courseOnlineClassDetailModalVisible = payload;
      if (!state.courseOnlineClassDetailModalVisible) {
        state.courseOnlineClassDetail = null;
      }
    },

    setCourseOnlineClassSessionDetail: (state, action) => {
      const payload = action.payload;
      state.courseOnlineClassSessionDetail = payload;
    },

    setCourseOnlineClassSessionDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.courseOnlineClassSessionDetailModalVisible = payload;
      if (!state.courseOnlineClassSessionDetailModalVisible) {
        state.courseOnlineClassSessionDetail = null;
      }
    },

    setAutoCourseOnlineClassSessionDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.autoCourseOnlineClassSessionDetailModalVisible = payload;
      if (!state.autoCourseOnlineClassSessionDetailModalVisible) {
        state.courseOnlineClassSessionDetail = null;
      }
    },

    setTopicDetail: (state, action) => {
      const payload = action.payload;
      state.topicDetail = payload;
    },
    setTopicDetailModalVisible: (state, action) => {
      const payload = action.payload;
      state.topicDetailModalVisible = payload;
      if (!state.topicDetailModalVisible) {
        state.topicDetail = null;
      }
    },
    setQuestionLevelDetail: (state, action) => {
      const payload = action.payload;
      state.questionLevelDetail = payload;
    },
    setQuestionLevelModalVisible: (state, action) => {
      const payload = action.payload;
      state.questionLevelDetailModalVisible = payload;
      if (!state.questionLevelDetailModalVisible) {
        state.questionLevelDetail = null;
      }
    },
    setQuestionLevelItemDetail: (state, action) => {
      const payload = action.payload;
      state.questionLevelItemDetail = payload;
    },
    setQuestionLevelItemModalVisible: (state, action) => {
      const payload = action.payload;
      state.questionLevelItemDetailModalVisible = payload;
      if (!state.questionLevelItemDetailModalVisible) {
        state.questionLevelItemDetail = null;
      }
    },

    setDataSearch: (state, action) => {
      const payload = action.payload;
      state.dataSearch = payload;
    },

    resetData: (state, action) => {
      state = initialState;
    },
    setRandom: (state, action) => {
      state.random = Math.random().toString(32);
    },

    setModalExamState: (state, action) => {
      const payload = action.payload;
      state.modalExamState.modalVisible = payload.modalVisible;
      state.modalExamState.type = payload.type;
      state.modalExamState.modalData = payload.modalData;
      if (!state.modalExamState.modalVisible) {
        state.modalExamState.modalData = null;
      }
    },
    setModalExamSkillState: (state, action) => {
      const payload = action.payload;
      state.modalExamSkillState.modalVisible = payload.modalVisible;
      state.modalExamSkillState.type = payload.type;
      state.modalExamSkillState.modalData = payload.modalData;
      if (!state.modalExamSkillState.modalVisible) {
        state.modalExamSkillState.modalData = null;
      }
    },
    setModalExamPartState: (state, action) => {
      const payload = action.payload;
      state.modalExamPartState.modalVisible = payload.modalVisible;
      state.modalExamPartState.type = payload.type;
      state.modalExamPartState.modalData = payload.modalData;
      if (!state.modalExamPartState.modalVisible) {
        state.modalExamPartState.modalData = null;
      }
    },
    setModalExamVariationState: (state, action) => {
      const payload = action.payload;
      console.log('payload', payload);
      state.modalExamVariationState.modalVisible = payload.modalVisible;
      state.modalExamVariationState.type = payload.type;
      state.modalExamVariationState.modalData = payload.modalData;
      if (!state.modalExamVariationState.modalVisible) {
        state.modalExamVariationState.modalData = null;
      }
    },

    setCurrentVariation: (state, action) => {
      const payload = action.payload;
      state.currentVariation = payload;
    },

    setRefreshSkill: (state, action) => {
      const payload = action.payload;
      state.refreshSkill = payload;
    },
    
    setRefreshPart: (state, action) => {
      const payload = action.payload;
      state.refreshPart = payload;
    },

    setDrawerDataState: (state, action) => {
      const payload = action.payload;
      state.drawerData = payload;
    },
  },
});
