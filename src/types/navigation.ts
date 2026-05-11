export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  parent_id: string | null;
  position: string | null;
  order_index: number;
  visible: boolean;
  open_in_new_tab: boolean;
  show_in_navbar: boolean;
  show_in_footer: boolean;
  is_external: boolean;
  module_key: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended type for UI rendering to support recursive hierarchical structures,
 * such as nested dropdown menus and future mega menus.
 */
export interface NavigationTreeItem extends NavigationItem {
  children?: NavigationTreeItem[];
}

/**
 * Utility type for creating or updating a NavigationItem via Supabase,
 * omitting auto-generated fields.
 */
export type NavigationItemPayload = Omit<
  NavigationItem,
  'id' | 'created_at' | 'updated_at'
>;
