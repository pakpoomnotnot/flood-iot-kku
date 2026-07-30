// หน้าสำหรับประชาชนทั่วไป (/map) ใช้ content เดียวกันกับหน้าเจ้าหน้าที่ (/dashboard) เป๊ะๆ
// ต่างกันแค่ isLoggedIn prop ที่ map/page.tsx ส่งเข้ามา ซึ่งคุมว่าจะโชว์เมนู
// "พื้นที่เสี่ยงน้ำท่วม" / "แนวทางป้องกันภัยน้ำท่วม" หรือไม่ (ดู dashboard-nav-admin.tsx)
export { default } from "./map-view-admin";
