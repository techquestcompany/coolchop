/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(res_tabs)` | `/(res_tabs)/` | `/(res_tabs)/profile` | `/(res_tabs)/search` | `/(tabs)` | `/(tabs)/` | `/(tabs)/profile` | `/(tabs)/search` | `/_sitemap` | `/add_dish` | `/add_restaurants` | `/customer` | `/location` | `/login` | `/profile` | `/reslogin` | `/search` | `/signup` | `/vendor` | `/verify`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
