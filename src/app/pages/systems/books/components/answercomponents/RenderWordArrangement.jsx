import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Radio, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import TDDragTag from '@/app/components/TDDragTag';
import TDInputTag from '@/app/components/TDInputTag';
import TDInputDragTag from '@/app/components/TDInputDragTag';

const RenderAnswersChoice = (props) => {
  const { form, } = props
  const handleChangeData = (data) => {
    // console.log(data)
    form.setFieldValue('wordArrangementAnswers', data)
  }
  return (
    <div className="row">
      <div className="col-xl-12">
        <Form.Item label={'Đáp án đúng'} name="answerList" initialValue={[]}>
          <TDInputDragTag />
        </Form.Item>
      </div>
      <div className="col-xl-12">
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.answerList !== currentValues.answerList}>
          {({ getFieldValue }) =>
            <Form.Item label={'Đảo thứ tự'} initialValue={[]}>
              <TDDragTag value={getFieldValue('answerList')} onChange={handleChangeData} />
            </Form.Item>
          }
        </Form.Item>
      </div>
    </div>
  )
}

export default RenderAnswersChoice