import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { fetchEvents } from '../services/api';

const ListScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();

      // Sort events by date
      const sortedEvents = (data.events || []).sort((a, b) => {
        return new Date(a.startsOn) - new Date(b.startsOn);
      });

      setEvents(sortedEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const openNavigation = (event) => {
    if (!event.locationCoords) {
      Alert.alert('No Location', 'This event does not have location coordinates.');
      return;
    }

    if (event.locationCoords.isVirtual) {
      Alert.alert('Virtual Event', 'This is an online event.');
      return;
    }

    const url = `https://maps.google.com/?q=${event.locationCoords.latitude},${event.locationCoords.longitude}`;
    Linking.openURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let dayLabel = '';
    if (eventDate.getTime() === today.getTime()) {
      dayLabel = 'Today';
    } else if (eventDate.getTime() === today.getTime() + 86400000) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const fullDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `${dayLabel}, ${fullDate} at ${time}`;
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventContent}>
        <Text style={styles.eventName}>{item.name}</Text>

        <View style={styles.eventDetails}>
          <Text style={styles.eventTime}>📅 {formatDate(item.startsOn)}</Text>

          {item.locationCoords && (
            <Text style={styles.eventLocation}>
              📍 {item.locationCoords.name}
              {item.locationCoords.isVirtual && ' (Virtual)'}
            </Text>
          )}

          {item.organizationName && (
            <Text style={styles.eventOrg}>
              👥 {item.organizationName}
            </Text>
          )}

          {item.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description.replace(/<[^>]*>/g, '')}
            </Text>
          )}
        </View>

        {item.locationCoords && !item.locationCoords.isVirtual && (
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => openNavigation(item)}
          >
            <Text style={styles.navigateButtonText}>🧭 Navigate to Event</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>
        Pull down to refresh or check back later
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#006747" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Text style={styles.headerSubtitle}>{events.length} events</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#006747"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 10,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventContent: {
    padding: 15,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#006747',
    marginBottom: 5,
  },
  eventOrg: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 5,
    lineHeight: 18,
  },
  navigateButton: {
    backgroundColor: '#006747',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default ListScreen;
