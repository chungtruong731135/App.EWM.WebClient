import { modalSlice, callTypes } from './Slice';

const { actions } = modalSlice;

export const setDataModal = data => dispatch => {
  dispatch(actions.setDataModal(data));
};

export const setModalVisible = data => dispatch => {
  dispatch(actions.setModalVisible(data));
};

export const setData2Modal = data => dispatch => {
  dispatch(actions.setData2Modal(data));
};

export const setModal2Visible = data => dispatch => {
  dispatch(actions.setModal2Visible(data));
};

export const setDataSearch = data => dispatch => {
  dispatch(actions.setDataSearch(data));
};

export const resetData = () => dispatch => {
  dispatch(actions.resetData());
};

export const setRandom = () => dispatch => {
  dispatch(actions.setRandom());
};

export const setCourseDetail = data => dispatch => {
  dispatch(actions.setCourseDetail(data));
};

export const setCourseDetailModalVisible = data => dispatch => {
  dispatch(actions.setCourseDetailModalVisible(data));
};

export const setCourseOnlineDetail = data => dispatch => {
  dispatch(actions.setCourseOnlineDetail(data));
};

export const setCourseOnlineDetailModalVisible = data => dispatch => {
  dispatch(actions.setCourseOnlineDetailModalVisible(data));
};

export const setCourseOnlineClassDetail = data => dispatch => {
  dispatch(actions.setCourseOnlineClassDetail(data));
};

export const setCourseOnlineClassDetailModalVisible = data => dispatch => {
  dispatch(actions.setCourseOnlineClassDetailModalVisible(data));
};

export const setCourseOnlineClassSessionDetail = data => dispatch => {
  dispatch(actions.setCourseOnlineClassSessionDetail(data));
};

export const setCourseOnlineClassSessionDetailModalVisible = data => dispatch => {
  dispatch(actions.setCourseOnlineClassSessionDetailModalVisible(data));
};

export const setTopicDetail = data => dispatch => {
  dispatch(actions.setTopicDetail(data));
};

export const setTopicDetailModalVisible = data => dispatch => {
  dispatch(actions.setTopicDetailModalVisible(data));
};

export const setQuestionLevelDetail = data => dispatch => {
  dispatch(actions.setQuestionLevelDetail(data));
};

export const setQuestionLevelModalVisible = data => dispatch => {
  dispatch(actions.setQuestionLevelModalVisible(data));
};

export const setQuestionLevelItemDetail = data => dispatch => {
  dispatch(actions.setQuestionLevelItemDetail(data));
};

export const setQuestionLevelItemModalVisible = data => dispatch => {
  dispatch(actions.setQuestionLevelItemModalVisible(data));
};

export const setAutoCourseOnlineClassSessionDetailModalVisible = data => dispatch => {
  dispatch(actions.setAutoCourseOnlineClassSessionDetailModalVisible(data));
};

export const setModalExamState = data => dispatch => {
  dispatch(actions.setModalExamState(data));
};

export const setModalExamSkillState = data => dispatch => {
  dispatch(actions.setModalExamSkillState(data));
};

export const setModalExamPartState = data => dispatch => {
  dispatch(actions.setModalExamPartState(data));
};

export const setModalExamVariationState = data => dispatch => {
  dispatch(actions.setModalExamVariationState(data));
};

export const setCurrentVariation = data => dispatch => {
  dispatch(actions.setCurrentVariation(data));
};

export const setRefreshSkill = data => dispatch => {
  dispatch(actions.setRefreshSkill(data));
};

export const setRefreshPart = data => dispatch => {
  dispatch(actions.setRefreshPart(data));
};

export const setDrawerDataState = (data) => (dispatch) => {
  dispatch(actions.setDrawerDataState(data));
};
