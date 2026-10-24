# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Run on a phone with Expo Go

1. Install dependencies from the `frontend` directory:

   ```bash
   npm install
   ```

2. Make sure the backend is running on the same computer on port `3000`. Keep the computer and phone on the same Wi-Fi network.

3. Start the frontend:
   ```bash
   npm start
   ```

4. Install Expo Go on your phone and scan the QR code printed by Expo. The start script explicitly selects Expo Go and LAN mode.

During development, API requests use the same LAN host Expo advertises for the Metro bundler, on backend port `3000`. If the backend is running on another computer or port, set `EXPO_PUBLIC_API_URL` to its reachable address, for example:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.20:3000/api"
npm start
```

Replace the example IP with the backend computer's LAN IP. The phone must be able to reach that computer and its port through the local network/firewall.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
