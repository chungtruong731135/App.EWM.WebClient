import { useState } from 'react';
import { requestGET, FILE_URL } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import { handleImage } from '@/utils/utils';

export const useQuestionData = form => {
  const [loading, setLoading] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [audioList, setAudioList] = useState([]);

  const parseAnswerString = answerString => {
    if (!answerString) return [];
    try {
      const parsed = JSON.parse(answerString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error('Error parsing answer string:', e);
      return [];
    }
  };

  const fetchQuestionData = async (questionId, isParent = false) => {
    try {
      setLoading(true);
      const res = await requestGET(`api/v1/questions/${questionId}`);
      const _data = res?.data;

      if (_data) {
        if (isParent) {
          const formattedData = {
            courseId: _data?.courseId,
            topicId: _data?.topicId,
            questionLevelId: _data?.questionLevelId,
            examAreaId: _data?.examAreaId,
            course: {
              value: _data?.courseId,
              label: _data?.courseTitle,
            },
            topic: {
              value: _data?.topicId,
              label: _data?.topicName,
            },
            questionLevel: {
              value: _data?.questionLevelId,
              label: _data?.questionLevelName,
            },
            examArea: {
              value: _data?.examAreaId,
              label: _data?.examAreaName,
            },
          };
          form.setFieldsValue(formattedData);
        } else {
          const formattedData = {
            ..._data,
            course: {
              value: _data?.courseId,
              label: _data?.courseTitle,
            },
            topic: {
              value: _data?.topicId,
              label: _data?.topicName,
            },
            questionLevel: {
              value: _data?.questionLevelId,
              label: _data?.questionLevelName,
            },
            examArea: {
              value: _data?.examAreaId,
              label: _data?.examAreaName,
            },
          };

          if (_data?.type === 1) {
            formattedData.answerString = parseAnswerString(_data.answerString);
          }

          setVideoList(handleImage(_data?.videoUrl ?? '', FILE_URL));
          setAudioList(handleImage(_data?.attachmentAudio ?? '', FILE_URL));
          form.setFieldsValue(formattedData);
        }
      }
    } catch (error) {
      console.error('Error fetching question data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    videoList,
    setVideoList,
    audioList,
    setAudioList,
    fetchQuestionData,
  };
};
