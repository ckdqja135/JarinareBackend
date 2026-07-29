/**
 * @role: pages — 메뉴 타입 정의
 * @rule: 타입 정의만 담당, 로직 포함 금지
 */
export type SubMenuItem = {
  text: string;
  link: string;
};

export type MenuItem = {
  text: string;
  icon: string;
  link?: string;
  subItems?: SubMenuItem[];
};
