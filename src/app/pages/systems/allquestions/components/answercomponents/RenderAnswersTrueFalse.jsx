import { Checkbox, Form, Input, Radio } from 'antd';
import { useEffect, useState } from 'react';

const initialChoices = [
    { content: 'Đúng', isCorrect: false },
    { content: 'Sai', isCorrect: false },
    { content: 'Không có thông tin', isCorrect: false }
];

const RenderAnswersChoice = (props) => {
    const { form } = props
    const [isHidden, setIsHidden] = useState(false);

    return (
        <div className="row">

            <div className="col-xl-12">
                <Form.Item label="Phương án">
                    <Form.List name="choiceAnswers" initialValue={initialChoices}>
                        {(fields, { add, remove }) => (
                            <>
                                <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                    <thead>
                                        <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                            <th>STT</th>
                                            <th>Nội dung</th>
                                            <th>Là đáp án đúng</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map(({ key, name, ...restField }, index) => (
                                            <tr key={key}>
                                                <td className="w-50px text-center pt-5">{index + 1}</td>
                                                <td className="pt-5">
                                                    <Form.Item {...restField} name={[name, 'content']} noStyle>
                                                        <Input />
                                                    </Form.Item>
                                                </td>

                                                <td className="w-150px text-center  pt-5">
                                                    <Form.Item {...restField} name={[name, 'isCorrect']} valuePropName="checked" noStyle>
                                                        <Radio defaultChecked={false}
                                                            onChange={e => {
                                                                if (e.target.checked) {
                                                                    const currentAnswers = form.getFieldValue('choiceAnswers') || [];
                                                                    const updatedAnswers = currentAnswers.map((item, idx) => ({
                                                                        ...item,
                                                                        isCorrect: idx === index, // Set true only for the selected answer
                                                                    }));
                                                                    form.setFieldsValue({ choiceAnswers: updatedAnswers });
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </td>
                                                {form.getFieldValue(['choiceAnswers', name, 'content']) === 'Không có thông tin' ? (
                                                    <td className="w-50px pt-5">
                                                        <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => {
                                                            remove(name);
                                                            setIsHidden(true);
                                                        }}>
                                                            <i className="fas fa-minus-circle fs-3"></i>
                                                        </button>
                                                    </td>
                                                ) : <td></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {
                                    fields.length < 2 || isHidden ? (
                                        <Form.Item>
                                            <button type="button" className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" 
                                                data-kt-stepper-action="next" 
                                                onClick={() => {
                                                    if (isHidden) {
                                                        add({ content: 'Không có thông tin', isCorrect: false });
                                                        setIsHidden(false);
                                                    } else {
                                                        add({ content: '', isCorrect: false });
                                                    }
                                                }}>
                                                Thêm
                                                <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                                                    <span className="path1" />
                                                    <span className="path2" />
                                                </i>{' '}
                                            </button>
                                        </Form.Item>
                                    ) : <></>
                                }
                            </>
                        )}
                    </Form.List>
                </Form.Item>
            </div>
        </div>
    )
}

export default RenderAnswersChoice