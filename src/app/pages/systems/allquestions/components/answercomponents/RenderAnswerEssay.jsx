import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Radio, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import TDInputTag from '@/app/components/TDInputTag';
import { TDEditorInline } from '@/app/components';
const RenderAnswerEssay = (props) => {
    const { form } = props
    return (
        <div className="row">
            {/* <div className="col-xl-12">
                <Form.Item label={'Đáp án'} name="AnswerDetail">
                    <TDEditorInline
                        data={form.getFieldValue('AnswerDetail') ? form.getFieldValue('AnswerDetail') : ''}
                        onChange={value => {
                            form.setFieldValue('AnswerDetail', value);
                        }}
                    />
                </Form.Item>
            </div> */}

        </div>
    )
}

export default RenderAnswerEssay