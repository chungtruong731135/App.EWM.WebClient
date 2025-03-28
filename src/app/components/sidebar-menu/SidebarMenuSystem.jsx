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

  return (
    <>
      <SidebarMenuItem to="/system/dashboard" icon="graph-4" title="Dashboard" fontIcon="bi-app-indicator" />

      {/* {CheckRole(currentPermissions, ['Permissions.Portal.Manage']) && (
        <SidebarMenuItemWithSub to="/system/book" title="Học liệu số" icon="book" fontIcon="bi-person">
          <SidebarMenuItem to="/system/book/search" title="Sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/types" title="Bộ sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/catalogs" title="Nhóm sách" hasBullet={true} />
          <SidebarMenuItem to="/system/book/grades" title="Khối lớp" hasBullet={true} />
          <SidebarMenuItem to="/system/book/subjects" title="Môn học" hasBullet={true} />
          <SidebarMenuItem to="/system/book/all-questions" title="Câu hỏi" hasBullet={true} />
        </SidebarMenuItemWithSub>
      )} */}

      {CheckRole(currentPermissions, ['Permissions.CourseOffline.Manage']) && (
        <SidebarMenuItemWithSub to="/system/study" title="Học tập" icon="briefcase" fontIcon="bi-person">
          {/* <SidebarMenuItem to="/system/study/examinats" title="Kỳ thi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/courses" title="Khoá học" hasBullet={true} />
          <SidebarMenuItem to="/system/study/topics" title="Chủ đề" hasBullet={true} />
          <SidebarMenuItem to="/system/study/questionlevels" title="Chương trình học" hasBullet={true} />
          <SidebarMenuItem to="/system/study/exams" title="Đề thi" hasBullet={true} /> */}
          <SidebarMenuItem to="/system/study/questions" title="Ngân hàng câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/questiongroups" title="Nhóm câu hỏi" hasBullet={true} />
          <SidebarMenuItem to="/system/study/papers" title="Tài liệu" hasBullet={true} />
          <SidebarMenuItem to="/system/study/examareas" title="Cấp độ" hasBullet={true} />
          {/* <SidebarMenuItem to="/system/study/contests" title="Cuộc thi thử" hasBullet={true} />
          <SidebarMenuItem to="/system/study/contestnotifications" title="Thông báo cuộc thi thử" hasBullet={true} />
          <SidebarMenuItem to="/system/study/tool-ho-tro-lay-goi-y" title="Hỗ trợ lấy gợi ý" hasBullet={true} /> */}
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
          {/* <SidebarMenuItem to="/system/general/category-groups" title="Nhóm danh mục" hasBullet={true} />
          <SidebarMenuItem to="/system/general/categories" title="Danh mục chung" hasBullet={true} />
          <SidebarMenuItem to="/system/general/banks" title="Danh sách ngân hàng" hasBullet={true} />
          <SidebarMenuItem to="/system/general/locations" title="Danh mục địa điểm" hasBullet={true} />
          <SidebarMenuItem to="/system/general/promotions" title="Mã khuyến mãi" hasBullet={true} />
          <SidebarMenuItem to="/system/general/surveyquestions" title="Câu hỏi khảo sát" hasBullet={true} /> */}
        </SidebarMenuItemWithSub>
      )}
    </>
  );
};

export { SidebarMenu };
