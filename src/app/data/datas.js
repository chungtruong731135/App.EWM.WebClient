export const Exam_LoaiDeThi = [
  {
    value: 0,
    label: 'Đề luyện tập theo chương trình học',
  },
  {
    value: 1,
    label: 'Đề thi thử',
  },
  {
    value: 2,
    label: 'Đề kiểm tra kiến thức',
  },
  {
    value: 3,
    label: 'Đề luyện thi, đánh giá (Hệ thống tạo tự động)',
  },
  {
    value: 4,
    label: 'Đề luyện theo chuyên đề (Hệ thống tạo tự động)',
  },
];

export const Survey_SourceType = [
  {
    value: 'CourseOffline',
    label: 'Khoá tự học',
  },
  {
    value: 'CourseOnline',
    label: 'Khoá học online',
  },
  {
    value: 'CourseClass',
    label: 'Lớp học online',
  },
  {
    value: 'OnlineProgram',
    label: 'Chương trình tuyển sinh khoá Online',
  },

  {
    value: 'AllUsers',
    label: 'Toàn bộ người dùng',
  },
];

export const Genders = [
  {
    value: 'Nam',
    label: 'Nam',
  },
  {
    value: 'Nữ',
    label: 'Nữ',
  },
  {
    value: 'Khác',
    label: 'Khác',
  },
];

export const ContestScoreboardVisibilities = [
  {
    value: 0,
    label: 'Có thể xem',
  },
  {
    value: 1,
    label: 'Luôn ẩn',
  },
  {
    value: 2,
    label: 'Ẩn khi đang trong cuộc thi',
  },
];
export const ContestStatuses = [
  {
    value: 0,
    label: 'Chưa diễn ra',
  },
  {
    value: 1,
    label: 'Đang diễn ra',
  },
  {
    value: 2,
    label: 'Đã kết thúc',
  },
  {
    value: 3,
    label: 'Tạm dừng',
  },
];

export const questionTypeMap = {
  0: 'Nhóm câu hỏi', // Group
  1: 'Chọn một đáp án', // SingleChoice (radio)
  2: 'Chọn nhiều đáp án', // MultipleChoice (checkbox)
  3: 'Câu hỏi tự luận', // Essay
  4: 'Điền vào chỗ trống', // FillInBlank (fill_blank)
  5: 'Sắp xếp từ', // WordArrangement
  6: 'Ghép đôi', // Matching (math_col)
  7: 'Đúng / Sai / Không có', // TrueFalse (answer_t_f_no)
  8: 'Sắp xếp đoạn văn', // Arrangement
  9: 'Kéo thả đáp án', // DragAndDrop (down_answer)
  10: 'Chọn bảng', // TableChoice

  // Others:
  11: 'Điền vào hình ảnh', // FillInImage (fill_input_img)
  // 12: 'Đánh dấu X', // XMarkAnswer (x_mark_answer)
  12: 'Chọn một đáp án điền vào chỗ trống', // SelectAnswer (select)
  // 14: 'Khoanh tròn đáp án', // CircleAnswer (circle_answer)
};

export const QUESTION_TYPES = [
  // { value: 0, label: 'Nhóm câu hỏi', icon: 'group', showMenu: true, typeKey: 'group' }, // no icon
  { value: 1, label: 'Chọn một đáp án', icon: 'radio', showMenu: true, typeKey: 1 },
  { value: 2, label: 'Chọn nhiều đáp án', icon: 'checkbox', showMenu: true, typeKey: 2 },
  { value: 3, label: 'Tự luận', icon: 'essay', showMenu: true, typeKey: 3 },
  { value: 4, label: 'Điền vào chỗ trống', icon: 'fill_blank', showMenu: true, typeKey: 4 },
  { value: 5, label: 'Sắp xếp từ', icon: 'down_answer', showMenu: true, typeKey: 5 },
  { value: 6, label: 'Ghép đôi', icon: 'math_col', showMenu: true, typeKey: 6 },
  { value: 7, label: 'Đúng / Sai / Không có', icon: 'true_false', showMenu: true, typeKey: 7 },
  { value: 8, label: 'Sắp xếp đoạn văn', icon: 'word_arrangement', showMenu: true, typeKey: 8 },
  { value: 9, label: 'Kéo thả đáp án', icon: 'select', showMenu: true, typeKey: 9 },
  { value: 10, label: 'Chọn bảng', icon: 'table_choice', showMenu: true, typeKey: 10 },
  { value: 11, label: 'Điền vào hình ảnh', icon: 'fill_input_img', showMenu: true, typeKey: 11 },
  { value: 12, label: 'Chọn một đáp án điền vào chỗ trống', icon: 'selectMulti', showMenu: true, typeKey: 12 },
];
