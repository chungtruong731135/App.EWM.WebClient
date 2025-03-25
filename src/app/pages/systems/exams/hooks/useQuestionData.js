import { useState, useCallback, useEffect } from 'react';
import { requestPOST } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

const INITIAL_PAGE = {
  pageNumber: 1,
  pageSize: 1000,
  orderBy: ['Order desc'],
};

export const useQuestionData = (examId, currentVariation, isGroupQuestions) => {
  const dispatch = useDispatch();
  const refreshSkill = useSelector(state => state.modal.refreshSkill);
  const refreshPart = useSelector(state => state.modal.refreshPart);
  const [dataQuestion, setDataQuestion] = useState([]);
  const [dataSkillPart, setDataSkillPart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(Math.random());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestPOST('api/v1/examquestionorders/search-all', {
        ...INITIAL_PAGE,
        examVariationId: currentVariation?.id,
      });
      setDataQuestion(res?.data ?? []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Lỗi khi tải dữ liệu câu hỏi');
    } finally {
      setIsLoading(false);
    }
  }, [currentVariation?.id]);

  const fetchDataSkillPart = useCallback(async () => {
    const res = await requestPOST(`api/v1/examskillparts/exam-skills`, {
      examId: examId,
    });
    var _data = res?.data ?? [];
    _data = _.orderBy(_data, ['sortOrder'], ['asc']);
    setDataSkillPart(_data);
  }, [examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshing]);

  useEffect(() => {
    if (isGroupQuestions) {
      fetchDataSkillPart();
    }
  }, [refreshSkill, fetchDataSkillPart, refreshPart, isGroupQuestions]);

  return {
    dataQuestion,
    dataSkillPart,
    setDataQuestion,
    setDataSkillPart,
    isLoading,
    setRefreshing,
  };
};
