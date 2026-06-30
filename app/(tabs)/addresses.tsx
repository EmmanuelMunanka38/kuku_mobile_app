import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { MapPin, Plus, Trash2, Check, Crosshair, Navigation } from 'lucide-react-native';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MAPBOX_TILE_URL } from '../../constants/map';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Address } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AddressesScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const mapRef = useRef<MapView>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/addresses');
      setAddresses(res.data);
    } catch {}
  };

  useEffect(() => { fetchAddresses(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.map.locationPermission, t.map.locationPermissionDenied);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude: lat, longitude: lng } = loc.coords;
      setLatitude(lat);
      setLongitude(lng);
      setShowMap(true);

      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode.length > 0) {
        const addr = geocode[0];
        setStreet([addr.streetNumber, addr.street, addr.district].filter(Boolean).join(' '));
        setCity(addr.city || addr.subregion || '');
        setState(addr.region || '');
      }

      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }, 300);
    } catch {
      Alert.alert(t.common.error, t.map.locationUnavailable);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAdd = async () => {
    if (!street || !city) { setSavingError('Street and city are required'); return; }
    setSaving(true);
    setSavingError('');
    try {
      await api.post('/users/addresses', {
        label, street, city, state, phone,
        latitude, longitude,
      });
      setShowForm(false);
      setShowMap(false);
      setLabel('');
      setStreet('');
      setCity('');
      setState('');
      setPhone('');
      setLatitude(undefined);
      setLongitude(undefined);
      await fetchAddresses();
    } catch (e: any) {
      setSavingError(e.response?.data?.error || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/users/addresses/${id}`);
            await fetchAddresses();
          } catch {}
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.profile.myAddresses}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{addresses.length} saved</Text>
      </View>

      <View style={styles.list}>
        {addresses.map((addr) => (
          <Card key={addr.id} variant="elevated" style={styles.addressCard}>
            <View style={styles.addressRow}>
              <MapPin size={20} color={colors.primary} strokeWidth={2} />
              <View style={styles.addressInfo}>
                <Text style={[styles.addressLabel, { color: colors.onSurface }]}>{addr.label || 'Address'}</Text>
                <Text style={[styles.addressText, { color: colors.onSurfaceVariant }]}>{addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''}</Text>
                {addr.phone && <Text style={[styles.addressPhone, { color: colors.onSurfaceVariant }]}>{addr.phone}</Text>}
              </View>
              {addr.isDefault && <Check size={16} color={colors.primary} strokeWidth={3} />}
              <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.deleteBtn}>
                <Trash2 size={16} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {addr.latitude && addr.longitude && (
              <View style={[styles.miniMapWrap, { borderTopColor: colors.surfaceContainerHigh }]}>
                <MapView
                  style={styles.miniMap}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  initialRegion={{
                    latitude: addr.latitude,
                    longitude: addr.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                >
                  <UrlTile urlTemplate={MAPBOX_TILE_URL} maximumZ={19} flipY={false} tileSize={512} shouldReplaceMapContent />
                  <Marker coordinate={{ latitude: addr.latitude, longitude: addr.longitude }} />
                </MapView>
              </View>
            )}
          </Card>
        ))}

        {addresses.length === 0 && !showForm && (
          <Card style={styles.emptyCard}>
            <MapPin size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No addresses saved yet</Text>
          </Card>
        )}

        {showForm && (
          <Card variant="elevated" style={styles.formCard}>
            <Input label="Label" value={label} onChangeText={setLabel} placeholder="e.g. Home, Work" />
            <Input label="Street *" value={street} onChangeText={setStreet} placeholder="123 Main Street" />
            <Input label="City *" value={city} onChangeText={setCity} placeholder="Dar es Salaam" />
            <Input label="State/Region" value={state} onChangeText={setState} placeholder="Dar es Salaam Region" />
            <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+255 7XX XXX XXX" keyboardType="phone-pad" />

            {!showMap ? (
              <Button
                title={t.map.useCurrentLocation}
                onPress={getCurrentLocation}
                loading={gettingLocation}
                variant="outline"
                icon={<Crosshair size={18} color={colors.primary} strokeWidth={2} />}
                style={{ marginTop: spacing.sm }}
              />
            ) : (
              <View style={styles.mapSection}>
                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={
                      latitude && longitude
                        ? { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                        : { latitude: -6.3690, longitude: 34.8888, latitudeDelta: 5, longitudeDelta: 5 }
                    }
                    onPress={handleMapPress}
                  >
                    <UrlTile
                      urlTemplate={MAPBOX_TILE_URL}
                      maximumZ={19}
                      flipY={false}
                      tileSize={512}
                      shouldReplaceMapContent
                    />
                    {latitude && longitude && (
                      <Marker
                        coordinate={{ latitude, longitude }}
                        draggable
                        onDragEnd={handleMapPress}
                        title={t.map.dragPinToSet}
                      />
                    )}
                  </MapView>
                </View>
                <Text style={[styles.mapHint, { color: colors.onSurfaceVariant }]}>
                  {t.map.dragPinToSet}
                </Text>
                <TouchableOpacity
                  style={[styles.refreshLocationBtn, { backgroundColor: colors.surfaceContainerLow }]}
                  onPress={getCurrentLocation}
                >
                  <Navigation size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={[styles.refreshLocationText, { color: colors.primary }]}>Refresh location</Text>
                </TouchableOpacity>
              </View>
            )}

            {savingError && <Text style={[styles.formError, { color: colors.error }]}>{savingError}</Text>}
            <View style={styles.formButtons}>
              <Button title={t.common.cancel} variant="outline" onPress={() => { setShowForm(false); setShowMap(false); setSavingError(''); }} style={{ flex: 1 }} />
              <Button title={t.common.save} onPress={handleAdd} loading={saving} style={{ flex: 1 }} />
            </View>
          </Card>
        )}
      </View>

      {!showForm && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setShowForm(true)} activeOpacity={0.9}>
          <Plus size={28} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.xxl },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.containerPadding },
  addressCard: { marginBottom: spacing.md },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  addressInfo: { flex: 1 },
  addressLabel: { ...typography.titleMd, fontWeight: '700' },
  addressText: { ...typography.bodySm, marginTop: 2 },
  addressPhone: { ...typography.bodySm, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  miniMapWrap: { borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden', height: 120 },
  miniMap: { width: '100%', height: '100%' },
  emptyCard: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, textAlign: 'center' },
  formCard: { marginBottom: spacing.md, padding: spacing.lg },
  formError: { ...typography.bodySm, marginBottom: spacing.md },
  formButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  mapSection: { marginTop: spacing.sm, gap: spacing.sm },
  mapContainer: { borderRadius: borderRadius.lg, overflow: 'hidden', height: 200 },
  map: { width: '100%', height: '100%' },
  mapHint: { ...typography.bodySm, textAlign: 'center' },
  refreshLocationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  refreshLocationText: { ...typography.bodySm, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
