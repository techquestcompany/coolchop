import { useEffect } from "react";
import { Alert, Button, Platform, SafeAreaView, StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Updates from "expo-updates";

export default function HomeScreen() {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded; apply it now
      // Updates.reloadAsync();
      // Alert.alert("Update downloaded and applied");

      dummyFunction();
    }
  }, [isUpdatePending]);

  const dummyFunction = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      Alert.alert("Error");
    }

    // UNCOMMENT TO REPRODUCE EAS UPDATE ERROR
    // } finally {
    //   console.log("dummyFunction");
    // }
  };

  // If true, we show the button to download and run the update
  const showDownloadButton = isUpdateAvailable;

  // Show whether or not we are running embedded code or an update
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
        <ThemedText type="subtitle">Updates Demo 5</ThemedText>
        <ThemedText>{runTypeMessage}</ThemedText>
        <Button
          onPress={() => Updates.checkForUpdateAsync()}
          title="Check manually for updates"
        />
        {showDownloadButton ? (
          <Button
            onPress={() => Updates.fetchUpdateAsync()}
            title="Download and run update"
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}