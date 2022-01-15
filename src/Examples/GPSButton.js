import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  Text,
} from 'react-native';
import { Button, List, useTheme } from 'react-native-paper';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

// const TASK_FETCH_LOCATION = 'TASK_FETCH_LOCATION';
// import {  } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
    });
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    alert(JSON.stringify(locations));
    storeData('location', locations);
    // do something with the locations captured in the background
  }
});

// TaskManager.defineTask(
//   TASK_FETCH_LOCATION,
//   async ({ data: { locations }, error }) => {
//     if (error) {
//       console.error(error);
//       return;
//     }
//     const [location] = locations;
//     try {
//       storeData('location', location);
//       // const url = `https://<your-api-endpoint>`;
//       // await axios.post(url, { location }); // you should use post instead of get to persist data on the backend
//     } catch (err) {
//       console.error(err);
//     }
//   }
// );

function startLocUpdateTask() {
  requestPermissions();
  // requestPermisrsions()
  // Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
  //   accuracy: Location.Accuracy.Highest,
  //   distanceInterval: 1, // minimum change (in meters) betweens updates
  //   deferredUpdatesInterval: 5000, // minimum interval (in milliseconds) between updates
  //   // foregroundService is how you get the task to be updated as often as would be if the app was open
  //   foregroundService: {
  //     notificationTitle: 'Using your location',
  //     notificationBody:
  //       'To turn off, go back to the app and switch something off.',
  //   },
  // });
}

function stopLocUpdateTask() {
  Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((value) => {
    if (value) {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  });
}

const GPSButton = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [text, setText] = useState('Waiting....');
  const [status, requestPermission] = Location.useBackgroundPermissions();
  const [running, setRunning] = useState(false);

  async function getLoc() {
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setText(JSON.stringify(location));
  }
  function startLocUpdate() {
    setRunning(true);
    startLocUpdateTask();
  }
  function stopLocUpdate() {
    setRunning(false);
    stopLocUpdateTask();
  }

  function displayText() {
    getData('location').then((data) => {
      setText(JSON.stringify(data));
    });
  }
  // useEffect(() => {
  //   setLocation(getData('location'));
  //   setText(JSON.stringify(location));
  // }, [getData('location')]);

  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
      </View>
      <List.Section title="Contained button">
        <View style={styles.row}>
          {running ? (
            <Button
              mode="contained"
              loading
              onPress={() => {}}
              style={styles.button}
            >
              Location Updating
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => startLocUpdate()}
              style={styles.button}
            >
              Start
            </Button>
          )}
          {running ? (
            <Button
              mode="contained"
              color={colors.accent}
              onPress={() => stopLocUpdate()}
              style={styles.button}
            >
              Stop
            </Button>
          ) : (
            <Button
              mode="contained"
              disabled
              onPress={() => {}}
              style={styles.button}
            >
              Stop
            </Button>
          )}
          <Button mode="contained" onPress={displayText} style={styles.button}>
            Show Locs
          </Button>
        </View>
      </List.Section>
    </ScrollView>
  );
};

GPSButton.title = 'GPSButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  button: {
    margin: 4,
  },
});

export default GPSButton;
