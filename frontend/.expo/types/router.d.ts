/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/customer`; params?: Router.UnknownInputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/info`; params?: Router.UnknownInputParams; } | { pathname: `/location`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/order`; params?: Router.UnknownInputParams; } | { pathname: `/order_cust`; params?: Router.UnknownInputParams; } | { pathname: `/reslogin`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/vendor`; params?: Router.UnknownInputParams; } | { pathname: `/verify`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin/add_restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/customer`; params?: Router.UnknownOutputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/info`; params?: Router.UnknownOutputParams; } | { pathname: `/location`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/order`; params?: Router.UnknownOutputParams; } | { pathname: `/order_cust`; params?: Router.UnknownOutputParams; } | { pathname: `/reslogin`; params?: Router.UnknownOutputParams; } | { pathname: `/signup`; params?: Router.UnknownOutputParams; } | { pathname: `/vendor`; params?: Router.UnknownOutputParams; } | { pathname: `/verify`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/add_restaurants`; params?: Router.UnknownOutputParams; } | { pathname: `/admin`; params?: Router.UnknownOutputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/customer${`?${string}` | `#${string}` | ''}` | `/forgot_password${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/info${`?${string}` | `#${string}` | ''}` | `/location${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/order${`?${string}` | `#${string}` | ''}` | `/order_cust${`?${string}` | `#${string}` | ''}` | `/reslogin${`?${string}` | `#${string}` | ''}` | `/signup${`?${string}` | `#${string}` | ''}` | `/vendor${`?${string}` | `#${string}` | ''}` | `/verify${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/add_dish${`?${string}` | `#${string}` | ''}` | `/add_dish${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(res_tabs)'}/search${`?${string}` | `#${string}` | ''}` | `/search${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/search${`?${string}` | `#${string}` | ''}` | `/search${`?${string}` | `#${string}` | ''}` | `/admin/add_restaurants${`?${string}` | `#${string}` | ''}` | `/admin${`?${string}` | `#${string}` | ''}` | `/admin/profile${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/customer`; params?: Router.UnknownInputParams; } | { pathname: `/forgot_password`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/info`; params?: Router.UnknownInputParams; } | { pathname: `/location`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/order`; params?: Router.UnknownInputParams; } | { pathname: `/order_cust`; params?: Router.UnknownInputParams; } | { pathname: `/reslogin`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/vendor`; params?: Router.UnknownInputParams; } | { pathname: `/verify`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/add_dish` | `/add_dish`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(res_tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/search` | `/search`; params?: Router.UnknownInputParams; } | { pathname: `/admin/add_restaurants`; params?: Router.UnknownInputParams; } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/admin/profile`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
