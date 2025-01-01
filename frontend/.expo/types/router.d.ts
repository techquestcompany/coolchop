/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/About`; params?: Router.UnknownInputParams; } | { pathname: `/add_restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/customer`; params?: Router.UnknownInputParams; } | { pathname: `/edit_profile`; params?: Router.UnknownInputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/location`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/logout`; params?: Router.UnknownInputParams; } | { pathname: `/manage_res`; params?: Router.UnknownInputParams; } | { pathname: `/manage_users`; params?: Router.UnknownInputParams; } | { pathname: `/order`; params?: Router.UnknownInputParams; } | { pathname: `/order_cust`; params?: Router.UnknownInputParams; } | { pathname: `/reslogin`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/Support`; params?: Router.UnknownInputParams; } | { pathname: `/UserHome`; params?: Router.UnknownInputParams; } | { pathname: `/UserSettings`; params?: Router.UnknownInputParams; } | { pathname: `/UserSupport`; params?: Router.UnknownInputParams; } | { pathname: `/vendor`; params?: Router.UnknownInputParams; } | { pathname: `/VendorNotifications`; params?: Router.UnknownInputParams; } | { pathname: `/vendorOrders`; params?: Router.UnknownInputParams; } | { pathname: `/VendorPayments`; params?: Router.UnknownInputParams; } | { pathname: `/vendorProfile`; params?: Router.UnknownInputParams; } | { pathname: `/vendorSettings`; params?: Router.UnknownInputParams; } | { pathname: `/verify`; params?: Router.UnknownInputParams; } | { pathname: `/res_info`; params?: Router.UnknownInputParams; } | { pathname: `/dish_info`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownInputParams; } | { pathname: `/admin/restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/admin/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin/users`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } } | { pathname: `/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/About`; params?: Router.UnknownOutputParams; } | { pathname: `/add_restaurants`; params?: Router.UnknownOutputParams; } | { pathname: `/customer`; params?: Router.UnknownOutputParams; } | { pathname: `/edit_profile`; params?: Router.UnknownOutputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/location`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/logout`; params?: Router.UnknownOutputParams; } | { pathname: `/manage_res`; params?: Router.UnknownOutputParams; } | { pathname: `/manage_users`; params?: Router.UnknownOutputParams; } | { pathname: `/order`; params?: Router.UnknownOutputParams; } | { pathname: `/order_cust`; params?: Router.UnknownOutputParams; } | { pathname: `/reslogin`; params?: Router.UnknownOutputParams; } | { pathname: `/signup`; params?: Router.UnknownOutputParams; } | { pathname: `/Support`; params?: Router.UnknownOutputParams; } | { pathname: `/UserHome`; params?: Router.UnknownOutputParams; } | { pathname: `/UserSettings`; params?: Router.UnknownOutputParams; } | { pathname: `/UserSupport`; params?: Router.UnknownOutputParams; } | { pathname: `/vendor`; params?: Router.UnknownOutputParams; } | { pathname: `/VendorNotifications`; params?: Router.UnknownOutputParams; } | { pathname: `/vendorOrders`; params?: Router.UnknownOutputParams; } | { pathname: `/VendorPayments`; params?: Router.UnknownOutputParams; } | { pathname: `/vendorProfile`; params?: Router.UnknownOutputParams; } | { pathname: `/vendorSettings`; params?: Router.UnknownOutputParams; } | { pathname: `/verify`; params?: Router.UnknownOutputParams; } | { pathname: `/res_info`; params?: Router.UnknownOutputParams; } | { pathname: `/dish_info`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownOutputParams; } | { pathname: `/admin`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/restaurants`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/search`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/users`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } } | { pathname: `/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/About${`?${string}` | `#${string}` | ''}` | `/add_restaurants${`?${string}` | `#${string}` | ''}` | `/customer${`?${string}` | `#${string}` | ''}` | `/edit_profile${`?${string}` | `#${string}` | ''}` | `/forgot_password${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/location${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/logout${`?${string}` | `#${string}` | ''}` | `/manage_res${`?${string}` | `#${string}` | ''}` | `/manage_users${`?${string}` | `#${string}` | ''}` | `/order${`?${string}` | `#${string}` | ''}` | `/order_cust${`?${string}` | `#${string}` | ''}` | `/reslogin${`?${string}` | `#${string}` | ''}` | `/signup${`?${string}` | `#${string}` | ''}` | `/Support${`?${string}` | `#${string}` | ''}` | `/UserHome${`?${string}` | `#${string}` | ''}` | `/UserSettings${`?${string}` | `#${string}` | ''}` | `/UserSupport${`?${string}` | `#${string}` | ''}` | `/vendor${`?${string}` | `#${string}` | ''}` | `/VendorNotifications${`?${string}` | `#${string}` | ''}` | `/vendorOrders${`?${string}` | `#${string}` | ''}` | `/VendorPayments${`?${string}` | `#${string}` | ''}` | `/vendorProfile${`?${string}` | `#${string}` | ''}` | `/vendorSettings${`?${string}` | `#${string}` | ''}` | `/verify${`?${string}` | `#${string}` | ''}` | `/res_info${`?${string}` | `#${string}` | ''}` | `/dish_info${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/add_dish${`?${string}` | `#${string}` | ''}` | `/add_dish${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/search${`?${string}` | `#${string}` | ''}` | `/search${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/search${`?${string}` | `#${string}` | ''}` | `/search${`?${string}` | `#${string}` | ''}` | `/admin${`?${string}` | `#${string}` | ''}` | `/admin/profile${`?${string}` | `#${string}` | ''}` | `/admin/restaurants${`?${string}` | `#${string}` | ''}` | `/admin/search${`?${string}` | `#${string}` | ''}` | `/admin/users${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/About`; params?: Router.UnknownInputParams; } | { pathname: `/add_restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/customer`; params?: Router.UnknownInputParams; } | { pathname: `/edit_profile`; params?: Router.UnknownInputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/location`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/logout`; params?: Router.UnknownInputParams; } | { pathname: `/manage_res`; params?: Router.UnknownInputParams; } | { pathname: `/manage_users`; params?: Router.UnknownInputParams; } | { pathname: `/order`; params?: Router.UnknownInputParams; } | { pathname: `/order_cust`; params?: Router.UnknownInputParams; } | { pathname: `/reslogin`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/Support`; params?: Router.UnknownInputParams; } | { pathname: `/UserHome`; params?: Router.UnknownInputParams; } | { pathname: `/UserSettings`; params?: Router.UnknownInputParams; } | { pathname: `/UserSupport`; params?: Router.UnknownInputParams; } | { pathname: `/vendor`; params?: Router.UnknownInputParams; } | { pathname: `/VendorNotifications`; params?: Router.UnknownInputParams; } | { pathname: `/vendorOrders`; params?: Router.UnknownInputParams; } | { pathname: `/VendorPayments`; params?: Router.UnknownInputParams; } | { pathname: `/vendorProfile`; params?: Router.UnknownInputParams; } | { pathname: `/vendorSettings`; params?: Router.UnknownInputParams; } | { pathname: `/verify`; params?: Router.UnknownInputParams; } | { pathname: `/res_info`; params?: Router.UnknownInputParams; } | { pathname: `/dish_info`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownInputParams; } | { pathname: `/admin/restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/admin/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin/users`; params?: Router.UnknownInputParams; } | `/+not-found` | `/${Router.SingleRoutePart<T>}` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } } | { pathname: `/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
