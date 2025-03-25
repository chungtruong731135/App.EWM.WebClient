import React from 'react';
import { useIntl } from 'react-intl';
import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu/SidebarMenuItemWithSub';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu/SidebarMenuItem';
import { useAuth } from '@/app/modules/auth';
import { CheckRole, CheckPermissions } from '@/utils/utils';

const SidebarMenu = () => {
  const intl = useIntl();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;
  const type = currentUser?.type;

  // null, 0 : người dùng hệ thống
  // 1: học sinh
  // 2: phụ huynh
  // 3: giáo viên
  // 4: cộng tác viên
  // 5: đại lý

  return type == null || type == 0 ? (
    <>
      <SidebarMenuItem to="/system/dashboard" icon="graph-4" title="Dashboard" fontIcon="bi-app-indicator" />

      {CheckRole(currentPermissions, ['Permissions.Portal.Manage']) && (
        <SidebarMenuItemWithSub to="/system/book" title="Học liệu số" icon="book" fontIcon="bi-person">
          <SidebarMenuItem to="/system/book/search" title="Sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/types" title="Bộ sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/catalogs" title="Nhóm sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/grades" title="Khối lớp" hasBullet={true} />
          <SidebarMenuItem to="/system/book/subjects" title="Môn học" hasBullet={true} />
          <SidebarMenuItem to="/system/book/all-questions" title="Câu hỏi" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )}

      {CheckRole(currentPermissions, ['Permissions.CourseOffline.Manage']) && (
        <SidebarMenuItemWithSub to="/system/study" title="Nội dung khoá học" icon="briefcase" fontIcon="bi-person">
          <SidebarMenuItem to="/system/study/examinats" title="Kỳ thi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/courses" title="Khoá học" hasBullet={true} />
          <SidebarMenuItem to="/system/study/topics" title="Chủ đề" hasBullet={true} />
          <SidebarMenuItem to="/system/study/questionlevels" title="Chương trình học" hasBullet={true} />
          <SidebarMenuItem to="/system/study/exams" title="Đề thi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/questions" title="Ngân hàng câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/questiongroups" title="Nhóm câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/papers" title="Tài liệu" hasBullet={true} />
          <SidebarMenuItem to="/system/study/examareas" title="Cấp độ" hasBullet={true} />
          <SidebarMenuItem to="/system/study/contests" title="Cuộc thi thử" hasBullet={true} />
          <SidebarMenuItem to="/system/study/contestnotifications" title="Thông báo cuộc thi thử" hasBullet={true} />
          <SidebarMenuItem to="/system/study/tool-ho-tro-lay-goi-y" title="Hỗ trợ lấy gợi ý" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )}

      <SidebarMenuItemWithSub to="/system/course-online" title="Khoá học online" icon="brifecase-timer" fontIcon="bi-person">
        {CheckPermissions(['Permissions.CourseOnline.Manage', 'Permissions.CourseOnline.View']) && <SidebarMenuItem to="/system/course-online/courses" title="Khoá học Online" hasBullet={true} />}
        {CheckPermissions(['Permissions.CourseOnlinePrograms.Manage', 'Permissions.CourseOnlinePrograms.View']) && (
          <SidebarMenuItem to="/system/course-online/courseonlineprograms" title="Chương trình tuyển sinh" hasBullet={true} />
        )}
        {CheckPermissions(['Permissions.CourseClasses.Manage', 'Permissions.CourseClasses.View']) && <SidebarMenuItem to="/system/course-online/course-classes" title="Lớp học" hasBullet={true} />}
        {CheckPermissions(['Permissions.ClassSessions.Manage', 'Permissions.ClassSessions.View']) && <SidebarMenuItem to="/system/course-online/class-sessions" title="Buổi học" hasBullet={true} />}
      </SidebarMenuItemWithSub>

      {(CheckRole(currentPermissions, ['Permissions.Courses.Manage']) || CheckRole(currentPermissions, ['Permissions.Activationcodes.Manage', 'Permissions.Activationcodes.View'])) && (
        <SidebarMenuItemWithSub to="/system/payment" title="Thanh toán khoá học" icon="briefcase" fontIcon="bi-person">
          {CheckRole(currentPermissions, ['Permissions.Courses.Manage']) && (
            <>
              <SidebarMenuItem to="/system/payment/usercourses" title="Khoá học đăng ký" hasBullet={true} />
              <SidebarMenuItem to="/system/payment/wait-courses" title="Khoá học chờ xác nhận" hasBullet={true} />
              <SidebarMenuItem to="/system/payment/active-courses" title="Khoá học đã thanh toán" hasBullet={true} />
            </>
          )}
          {CheckRole(currentPermissions, ['Permissions.Activationcodes.Manage', 'Permissions.Activationcodes.View']) && (
            <SidebarMenuItem to="/system/payment/activationcodes" title="Quản lý mã kích hoạt khoá học" hasBullet={true} />
          )}
          {CheckRole(currentPermissions, ['Permissions.Activationcodes.Manage', 'Permissions.Activationcodes.View']) && <SidebarMenuItem to="/system/payment/vietqrlogs" title="Nhật ký thanh toán qua VietQR" hasBullet={true} />}
          {/*{CheckRole(currentPermissions, ['Permissions.Activationcodes.Manage','Permissions.Activationcodes.View',]) && <SidebarMenuItem to="/system/payment/invoices" title="Giao dịch với Đại lý/Cộng tác viên" hasBullet={true} />} */}
        </SidebarMenuItemWithSub>
      )}
      {CheckRole(currentPermissions, ['Permissions.Portal.Manage']) && (
        <SidebarMenuItemWithSub to="/system/portal" title="Cổng thông tin" icon="chrome" fontIcon="bi-person">
          <SidebarMenuItem to="/system/portal/article-catalogs" title="Chuyên mục" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/articles" title="Bài viết" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/learningonlines" title="Học trực tuyến" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/discussions" title="Thảo luận, câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/feedbacks" title="Phản hồi, góp ý" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/notifications" title="Thông báo" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/parents-comments" title="Nhận xét của phụ huynh" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/banners" title="Quản trị Banner" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/popups" title="Quản trị Popup" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/teachers" title="Giáo viên" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/dictionaries" title="Từ điển thuật ngữ" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/dictionarywords" title="Từ điển tiếng Trung" hasBullet={true} />
          <SidebarMenuItem to="/system/portal/dictionarytitles" title="Danh mục sổ tay" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )}
      {(CheckRole(currentPermissions, ['Permissions.Reports.Manage']) || CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage'])) && (
        <SidebarMenuItemWithSub to="/system/reports" title="Thống kê báo cáo" icon="menu" fontIcon="bi-person">
          {/*   {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/revenue" title="Thống kê doanh thu khoá học theo thời gian" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/invoice" title="Thống kê doanh thu thực nhận theo thời gian" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/debt" title="Tổng hợp công nợ" hasBullet={true} />} */}

          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/partner" title="Thống kê doanh thu theo đại lý/cộng tác viên" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/examinats" title="Thống kê doanh thu - số lượt kích hoạt theo kỳ thi" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/doi-soat-ctv" title="Đối soát thông tin giao dịch" hasBullet={true} />}

          {CheckRole(currentPermissions, ['Permissions.ReportPayment.Manage']) && <SidebarMenuItem to="/system/reports/thong-ke-theo-loai" title="Thống kê giao dịch theo loại khoá học" hasBullet={true} />}

          {<SidebarMenuItem to="/system/reports/nguon-khach-hang" title="Thống kê theo nguồn khách hàng" hasBullet={true} />}
          <SidebarMenuItem to="/system/reports/course-online" title="Thống kê khoá học online" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )}
      {(CheckRole(currentPermissions, ['Permissions.Users.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.Distributors.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.Permissions.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.Users.Delete']) ||
        CheckRole(currentPermissions, ['Permissions.Students.Manage'])) && (
          <SidebarMenuItemWithSub to="/system/users" title="Hệ thống người dùng" icon="profile-user" fontIcon="bi-person">
            {CheckRole(currentPermissions, ['Permissions.Students.Manage']) && <SidebarMenuItem to="/system/users/students" title="Học sinh" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Students.Manage']) && <SidebarMenuItem to="/system/users/parents" title="Phụ huynh" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Users.Manage']) && <SidebarMenuItem to="/system/users/teachers" title="Giáo viên" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Distributors.Manage']) && <SidebarMenuItem to="/system/users/retailers" title="Cộng tác viên" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Distributors.Manage']) && <SidebarMenuItem to="/system/users/distributors" title="Đại lý" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Users.Manage']) && <SidebarMenuItem to="/system/users/others" title="Người dùng hệ thống" hasBullet={true} />}
          </SidebarMenuItemWithSub>
        )}
      {CheckRole(currentPermissions, ['Permissions.CommonCategories.Manage']) && (
        <SidebarMenuItemWithSub to="/system/general" title="Danh mục chung" icon="category" fontIcon="bi-person">
          <SidebarMenuItem to="/system/general/category-groups" title="Nhóm danh mục" hasBullet={true} />
          <SidebarMenuItem to="/system/general/categories" title="Danh mục chung" hasBullet={true} />
          <SidebarMenuItem to="/system/general/banks" title="Danh sách ngân hàng" hasBullet={true} />
          <SidebarMenuItem to="/system/general/locations" title="Danh mục địa điểm" hasBullet={true} />
          <SidebarMenuItem to="/system/general/promotions" title="Mã khuyến mãi" hasBullet={true} />
          <SidebarMenuItem to="/system/general/surveyquestions" title="Câu hỏi khảo sát" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )}
      {(CheckRole(currentPermissions, ['Permissions.System.Manage']) || CheckRole(currentPermissions, ['Permissions.Email.Manage'])) && (
        <SidebarMenuItemWithSub to="/system/other" title="Hệ thống" icon="setting-2" fontIcon="bi-person">
          {CheckRole(currentPermissions, ['Permissions.System.Manage']) && <SidebarMenuItem to="/system/other/settings" title="Cấu hình hệ thống" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.System.Manage']) && <SidebarMenuItem to="/system/other/audits" title="Nhật ký hoạt động" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.System.Manage']) && <SidebarMenuItem to="/system/other/loginlogs" title="Nhật ký đăng nhập" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Email.Manage']) && <SidebarMenuItem to="/system/other/emailconfigs" title="Cấu hình email" hasBullet={true} />}
        </SidebarMenuItemWithSub>
      )}
      {/* <SidebarMenuItemWithSub to="/system/fix-data" title="Sửa dữ liệu" icon="notepad-edit" fontIcon="bi-person">
        <SidebarMenuItem to="/system/fix-data/questions" title="Ngân hàng câu hỏi" hasBullet={true} />
        <SidebarMenuItem to="/system/fix-data/exams" title="Đề thi" hasBullet={true} />
      </SidebarMenuItemWithSub> */}
      {CheckRole(currentPermissions, ['Permissions.Supports.Manage', 'Permissions.Supports.View', 'Permissions.Survey.Manage', 'Permissions.ExamRegistrations.Manage', 'Permissions.Survey.View']) && (
        <SidebarMenuItemWithSub to="/system/supports" title="Chăm sóc khách hàng" icon="support-24" fontIcon="bi-person">
          {CheckRole(currentPermissions, ['Permissions.ExamRegistrations.Manage']) && <SidebarMenuItem to="/system/supports/examregistrations" title="Khách hàng đăng ký thi" hasBullet={true} />}
          {(CheckRole(currentPermissions, ['Permissions.Survey.Manage']) || CheckRole(currentPermissions, ['Permissions.Survey.View'])) && (
            <SidebarMenuItem to="/system/supports/surveytemplates" title="Nhóm khảo sát" hasBullet={true} />
          )}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userexampapers" title="Khách hàng làm bài kiểm tra" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userpapers" title="Khách hàng đăng ký tư vấn" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/khach-hang-thi-thu" title="Khách hàng tham gia thi thử" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/reply-userpapers" title="Khách hàng đăng ký tư vấn chờ xử lý" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-hoc-cung-thay-co" title="Khoá học cùng thầy cô" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-tu-hoc" title="Khoá tự học" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-sap-het-han" title="Khoá tự học sắp hết hạn" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/dang-ky-hoc-thu" title="Đăng ký học thử" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/wait-courses" title="Khoá học chờ khách hàng thanh toán" hasBullet={true} />}
          {/*  {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/tra-cuu-thong-tin" title="Tra cứu thông tin khách hàng" hasBullet={true} />} */}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/tra-cuu-khoa-hoc" title="Tra cứu khoá học đăng ký" hasBullet={true} />}
          {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/messagecustomers" title="Tin nhắn gửi khách hàng" hasBullet={true} />}

          {/* <SidebarMenuItem to="/system/supports/customers" title="Danh sách khách hàng" hasBullet={true} /> */}
        </SidebarMenuItemWithSub>
      )}

      <SidebarMenuItemWithSub to="/system/leads" title="Khách hàng tiềm năng" icon="support-24" fontIcon="bi-person">
        <SidebarMenuItem to="/system/leads/khach-hang-tiem-nang" title="Khách hàng tiềm năng" hasBullet={true} />
        <SidebarMenuItem to="/system/leads/yeu-cau-tu-van" title="Yêu cầu tư vấn" hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub to="/system/customers" title="Khách hàng" icon="support-24" fontIcon="bi-person">
        <SidebarMenuItem to="/system/customers/danh-sach-khach-hang" title="Danh sách khách hàng" hasBullet={true} />
        <SidebarMenuItem to="/system/customers/yeu-cau-tu-van" title="Yêu cầu tư vấn" hasBullet={true} />
      </SidebarMenuItemWithSub>
    </>
  ) : type == 3 ? (
    <>
      <SidebarMenuItem to="/system/dashboard" icon="graph-4" title={intl.formatMessage({ id: 'MENU.DASHBOARD' })} fontIcon="bi-app-indicator" />

      <SidebarMenuItemWithSub to="/system/teachers" title="Khoá học online" icon="brifecase-timer" fontIcon="bi-person">
        <SidebarMenuItem to="/system/teachers/course-classes" title="Lớp học" hasBullet={true} />
        <SidebarMenuItem to="/system/teachers/class-sessions" title="Buổi học" hasBullet={true} />
      </SidebarMenuItemWithSub>

      {/* {import.meta.env.VITE_APP_SYSTEM_TYPE == 'codemath' && (
        <SidebarMenuItemWithSub to="/system/fix-data" title="Sửa dữ liệu" icon="notepad-edit" fontIcon="bi-person">
          <SidebarMenuItem to="/system/fix-data/questions" title="Ngân hàng câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/fix-data/exams" title="Đề thi" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )} */}

      {(CheckRole(currentPermissions, ['Permissions.Supports.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.Supports.View']) ||
        CheckRole(currentPermissions, ['Permissions.Survey.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.ExamRegistrations.Manage']) ||
        CheckRole(currentPermissions, ['Permissions.Survey.View'])) && (
          <SidebarMenuItemWithSub to="/system/supports" title="Chăm sóc khách hàng" icon="support-24" fontIcon="bi-person">
            {(CheckRole(currentPermissions, ['Permissions.Survey.Manage']) || CheckRole(currentPermissions, ['Permissions.Survey.View'])) && (
              <SidebarMenuItem to="/system/supports/surveytemplates" title="Nhóm khảo sát" hasBullet={true} />
            )}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userexampapers" title="Khách hàng làm bài kiểm tra" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userpapers" title="Khách hàng đăng ký tư vấn" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/khach-hang-thi-thu" title="Khách hàng tham gia thi thử" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/reply-userpapers" title="Khách hàng đăng ký tư vấn chờ xử lý" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-hoc-cung-thay-co" title="Khoá học cùng thầy cô" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-tu-hoc" title="Khoá tự học" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.Manage']) && <SidebarMenuItem to="/system/supports/khoa-sap-het-han" title="Khoá tự học sắp hết hạn" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/dang-ky-hoc-thu" title="Đăng ký học thử" hasBullet={true} />}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/wait-courses" title="Khoá học chờ khách hàng thanh toán" hasBullet={true} />}
            {/*  {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/tra-cuu-thong-tin" title="Tra cứu thông tin khách hàng" hasBullet={true} />} */}
            {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/tra-cuu-khoa-hoc" title="Tra cứu khoá học đăng ký" hasBullet={true} />}
          </SidebarMenuItemWithSub>
        )}
    </>
  ) : type == 4 || type == 5 ? (
    <>
      <SidebarMenuItem to="/system/sales/dashboard" icon="graph-4" title={intl.formatMessage({ id: 'MENU.DASHBOARD' })} fontIcon="bi-app-indicator" />
      <SidebarMenuItem to="/system/sales/activationcodes" icon="purchase" title={'Mã kích hoạt khoá học'} fontIcon="bi-app-indicator" />
      <SidebarMenuItem to="/system/sales/courses" icon="parcel" title={'Khoá học'} fontIcon="bi-app-indicator" />
      <SidebarMenuItemWithSub to="/system/course-online" title="Khoá học online" icon="brifecase-timer" fontIcon="bi-person">
        {CheckPermissions(['Permissions.CourseOnline.Manage', 'Permissions.CourseOnline.View']) && <SidebarMenuItem to="/system/course-online/courses" title="Khoá học Online" hasBullet={true} />}
        {CheckPermissions(['Permissions.CourseOnlinePrograms.Manage', 'Permissions.CourseOnlinePrograms.View']) && (
          <SidebarMenuItem to="/system/course-online/courseonlineprograms" title="Chương trình tuyển sinh" hasBullet={true} />
        )}
        {CheckPermissions(['Permissions.CourseClasses.Manage', 'Permissions.CourseClasses.View']) && <SidebarMenuItem to="/system/course-online/course-classes" title="Lớp học" hasBullet={true} />}
        {CheckPermissions(['Permissions.ClassSessions.Manage', 'Permissions.ClassSessions.View']) && <SidebarMenuItem to="/system/course-online/class-sessions" title="Buổi học" hasBullet={true} />}
      </SidebarMenuItemWithSub>

      <SidebarMenuItem to="/system/sales/usercourses" icon="brifecase-timer" title={'Khóa học chờ đăng ký'} fontIcon="bi-app-indicator" />
      <SidebarMenuItem to="/system/sales/histories" icon="element-equal" title={'Lịch sử kích hoạt'} fontIcon="bi-app-indicator" />

      <SidebarMenuItemWithSub to="/system/supports" title="Chăm sóc khách hàng" icon="support-24" fontIcon="bi-person">
        {(CheckRole(currentPermissions, ['Permissions.ExamRegistrations.Manage']) || CheckRole(currentPermissions, ['Permissions.Survey.View'])) && (
          <SidebarMenuItem to="/system/supports/examregistrations" title="Khách hàng đăng ký thi" hasBullet={true} />
        )}
        {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userexampapers" hasBullet={true} title="Khách hàng làm bài kiểm tra" />}
        {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/userpapers" hasBullet={true} title="Khách hàng đăng ký tư vấn" />}
        {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/khach-hang-thi-thu" hasBullet={true} title="Khách hàng tham gia thi thử" />}
        <SidebarMenuItem to="/system/supports/reply-userpapers" title="Khách hàng đăng ký tư vấn chờ xử lý" hasBullet={true} />

        <SidebarMenuItem to="/system/supports/khoa-hoc-cung-thay-co" title="Khoá học cùng thầy cô" hasBullet={true} />
        <SidebarMenuItem to="/system/supports/khoa-tu-hoc" title="Khoá tự học" hasBullet={true} />
        <SidebarMenuItem to="/system/supports/khoa-sap-het-han" title="Khoá tự học sắp hết hạn" hasBullet={true} />
        <SidebarMenuItem to="/system/supports/dang-ky-hoc-thu" title="Đăng ký học thử" hasBullet={true} />
        {CheckRole(currentPermissions, ['Permissions.Supports.View']) && <SidebarMenuItem to="/system/supports/wait-courses" title="Khoá học chờ khách hàng thanh toán" hasBullet={true} />}
        {/* <SidebarMenuItem to="/system/supports/tra-cuu-thong-tin" title="Tra cứu thông tin khách hàng" hasBullet={true} /> */}
        <SidebarMenuItem to="/system/supports/tra-cuu-khoa-hoc" title="Tra cứu khoá học đăng ký" hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub to="/system/leads" title="Khách hàng tiềm năng" icon="support-24" fontIcon="bi-person">
        <SidebarMenuItem to="/system/leads/khach-hang-tiem-nang" title="Khách hàng tiềm năng" hasBullet={true} />
        <SidebarMenuItem to="/system/leads/yeu-cau-tu-van" title="Yêu cầu tư vấn" hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub to="/system/customers" title="Khách hàng" icon="profile-user" fontIcon="bi-person">
        <SidebarMenuItem to="/system/customers/danh-sach-khach-hang" title="Danh sách khách hàng" hasBullet={true} />
        <SidebarMenuItem to="/system/customers/yeu-cau-tu-van" title="Yêu cầu tư vấn" hasBullet={true} />
      </SidebarMenuItemWithSub>
    </>
  ) : (
    <></>
  );
};

export { SidebarMenu };
