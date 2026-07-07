// Custom entrypoint (replaces the default "expo-router/entry" from
// package.json's "main" field). Needed only because
// react-native-android-widget requires registerWidgetTaskHandler to be
// called at the app's registration root — expo-router's stock entry file
// doesn't leave a hook for that, so we reproduce it here and add the one
// extra line.
//
// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh
// works on web.
import "@expo/metro-runtime";

import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import { widgetTaskHandler } from "./widgets/widget-task-handler";

renderRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);
