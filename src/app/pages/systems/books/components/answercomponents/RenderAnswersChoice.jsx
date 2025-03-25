import { Checkbox, Form, Radio } from 'antd';

import { TDEditorInline } from '@/app/components';

const RenderAnswersChoice = props => {
  const { form, isSingleChoice } = props;
  return (
    <div className="row">
      <div className="col-xl-12">
        <Form.Item label="Phương án">
          <Form.List name="choiceAnswers">
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
                          <Form.Item {...restField} name={[name, 'content']} noStyle valuePropName="data">
                            <TDEditorInline
                              data={form.getFieldValue(['answers', name, 'content']) ? form.getFieldValue(['answers', name, 'content']) : ''}
                              onChange={value => {
                                form.setFieldValue(['answers', name, 'content'], value);
                              }}
                            />
                          </Form.Item>
                        </td>

                        <td className="w-150px text-center  pt-5">
                          <Form.Item {...restField} name={[name, 'isCorrect']} valuePropName="checked" noStyle>
                            {
                              isSingleChoice ?
                                <Radio onChange={() => {
                                  const currentAnswers = form.getFieldValue('choiceAnswers') || [];
                                  const updatedAnswers = currentAnswers.map((item, idx) => ({
                                    ...item,
                                    isCorrect: idx === index, // Set true only for the selected answer
                                  }));
                                  form.setFieldsValue({ choiceAnswers: updatedAnswers });
                                }} />
                                :
                                <Checkbox
                                  placeholder="Là câu trả lời đúng"
                                  defaultChecked={false}
                                // onChange={e => {
                                //   if (e.target.checked && isSingleChoice) {
                                //     const currentAnswers = form.getFieldValue('choiceAnswers') || [];
                                //     const updatedAnswers = currentAnswers.map((item, idx) => ({
                                //       ...item,
                                //       isCorrect: idx === index, // Set true only for the selected answer
                                //     }));
                                //     form.setFieldsValue({ choiceAnswers: updatedAnswers });
                                //   }
                                // }}
                                />
                            }

                          </Form.Item>
                        </td>
                        <td className="w-50px  pt-5">
                          <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                            <i className="fas fa-minus-circle fs-3"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Form.Item>
                  <button
                    type="button"
                    className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                    data-kt-stepper-action="next"
                    onClick={() => add()}
                  >
                    Thêm
                    <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                      <span className="path1" />
                      <span className="path2" />
                    </i>{' '}
                  </button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </div>
    </div>
  );
};

export default RenderAnswersChoice;
