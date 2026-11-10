import { Alert, Button, Platform, SafeAreaView, StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Updates from "expo-updates";

export default function HomeScreen() {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();
  const updatesAvailable = Updates.isEnabled && !__DEV__;

  const checkForUpdates = async () => {
    if (!updatesAvailable) return;
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        Alert.alert("No updates available", "You're already using the latest version.");
      }
    } catch (e) {
      Alert.alert(
        "Couldn't check for updates",
        e instanceof Error ? e.message : "Please try again later."
      );
    }
  };

  const applyUpdate = async () => {
    if (!updatesAvailable) return;
    try {
      if (!isUpdatePending) {
        const result = await Updates.fetchUpdateAsync();
        if (!result.isNew) {
          Alert.alert("No updates available", "You're already using the latest version.");
          return;
        }
      }
      await Updates.reloadAsync();
    } catch (e) {
      Alert.alert(
        "Couldn't apply update",
        e instanceof Error ? e.message : "Please try again later."
      );
    }
  };

  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? "This app is running from built-in code"
    : "This app is running an update";

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: 10,
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedText type="subtitle">App updates</ThemedText>
        <ThemedText>{runTypeMessage}</ThemedText>
        {!updatesAvailable ? (
          <ThemedText>
            Over-the-air updates are unavailable in this build. Install a production build
            with Expo Updates enabled to check for or apply updates.
          </ThemedText>
        ) : null}
        <Button
          onPress={checkForUpdates}
          title="Check for updates"
          disabled={!updatesAvailable}
        />
        {updatesAvailable && (isUpdateAvailable || isUpdatePending) ? (
          <Button
            onPress={applyUpdate}
            title={isUpdatePending ? "Apply downloaded update" : "Download and apply update"}
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}