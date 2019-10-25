import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Button } from 'react-native-elements';
import AppLink from 'react-native-app-link';
import * as Permissions from 'expo-permissions';

const LOCATION_TASK_NAME = 'background-location-task';
const locations = {
    home: {
        latitude: '32.08',
        longitude: '34.89'
    },
    work: {
        // TODO
        latitude: '42.08',
        longitude: '44.89'
    }
}

export default () => {
    const [syncing, setSyncing] = useState(false);

    startLocationAsync = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.LOCATION);
            if (status === 'granted') {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Balanced,
                });
            } else {
                Alert.alert('turn on GPS please.');
            }

        } catch (error) {
            console.error(error);
        }

        setSyncing(true);
    };

    stopLocationAsync = async () => {
        try {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

            setSyncing(false);
        } catch (error) {
            console.error(error)
        }
    };

    renderButton = () => {
        if (syncing) {
            return (
                <Button
                    icon={{
                        name: "cloud-off",
                        size: 15,
                        color: "white"
                    }}
                    title="Turn OFF"
                    onPress={stopLocationAsync}
                    buttonStyle={{ backgroundColor: 'red' }}
                />
            )
        } else {
            return (
                <Button
                    icon={{
                        name: "cloud",
                        size: 15,
                        color: "white"
                    }}
                    title="Turn ON"
                    onPress={startLocationAsync}
                    buttonStyle={{ backgroundColor: 'green' }}
                />
            )
        }
    }

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#6BCAE2'
        }}>
            {renderButton()}
        </View>
    );
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        const { locations } = data;
        const { latitude, longitude } = locations[0].coords;

        checkLocation({ latitude, longitude });
    }
});

checkLocation = ({ latitude, longitude }) => {
    const { home, work } = locations;
    const coords = { latitude, longitude };
    const atHome = compareLocation(home, coords);
    const atWork = compareLocation(work, coords);

    atHome && openApp();
}

compareLocation = (locA, locB) => {
    const locALat = locA.latitude.toString().substring(0, 5);
    const locALong = locA.longitude.toString().substring(0, 5);
    const locBLat = locB.latitude.toString().substring(0, 5);
    const locBLong = locB.longitude.toString().substring(0, 5);

    return locALat === locBLat && locALong === locBLong;
}

openApp = async () => {
    try {
        const url = 'facebook://app'
        const supported = await AppLink.maybeOpenURL(url, { appName: 'facebook', appStoreId: 'com.facebook' });

        if (supported) {
            AppLink.openURL(url, { appName: 'facebook', appStoreId: 'com.facebook' });
        } else {
            Alert.alert('failed to open the app.')
        }
    } catch (error) {
        console.error(error);
    }

}