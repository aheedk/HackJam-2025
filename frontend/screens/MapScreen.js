import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchEvents } from '../services/api';

const MapScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // USF Campus center coordinates
  const USF_CENTER = {
    latitude: 28.0654,
    longitude: -82.4184,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    loadEvents();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is needed to show your position on the map.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data.events || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByLocation = () => {
    const grouped = {};

    events.forEach((event) => {
      if (event.locationCoords) {
        const key = `${event.locationCoords.latitude},${event.locationCoords.longitude}`;

        if (!grouped[key]) {
          grouped[key] = {
            coords: event.locationCoords,
            events: [],
          };
        }

        grouped[key].events.push(event);
      }
    });

    return Object.values(grouped);
  };

  const handleMarkerPress = (locationData) => {
    setSelectedLocation(locationData);
    setModalVisible(true);
  };

  const openNavigation = (coords) => {
    const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const groupedLocations = groupEventsByLocation();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#006747" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={USF_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {groupedLocations.map((locationData, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            }}
            pinColor={locationData.coords.isVirtual ? '#4A90E2' : '#006747'}
            onPress={() => handleMarkerPress(locationData)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{locationData.coords.name}</Text>
                <Text style={styles.calloutText}>
                  {locationData.events.length} event(s)
                </Text>
                <Text style={styles.calloutTap}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLocation && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedLocation.coords.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalAddress}>
                  {selectedLocation.coords.address}
                </Text>

                {!selectedLocation.coords.isVirtual && (
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={() => openNavigation(selectedLocation.coords)}
                  >
                    <Text style={styles.navigationButtonText}>
                      🧭 Navigate Here
                    </Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.eventsHeader}>
                  Events ({selectedLocation.events.length})
                </Text>

                <ScrollView style={styles.eventsList}>
                  {selectedLocation.events.map((event, idx) => (
                    <View key={idx} style={styles.eventCard}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventTime}>
                        {formatDate(event.startsOn)}
                      </Text>
                      {event.organizationName && (
                        <Text style={styles.eventOrg}>
                          by {event.organizationName}
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
  },
  calloutTap: {
    fontSize: 10,
    color: '#006747',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006747',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  navigationButton: {
    backgroundColor: '#006747',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  eventsList: {
    maxHeight: 300,
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  eventOrg: {
    fontSize: 12,
    color: '#006747',
    fontStyle: 'italic',
  },
});

export default MapScreen;
