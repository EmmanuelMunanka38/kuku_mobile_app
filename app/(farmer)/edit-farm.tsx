import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';

export default function EditFarmScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/farms/my-farm').then(({ data }) => {
      setName(data.name);
      setDescription(data.description || '');
      setCity(data.city || '');
      setAddress(data.address || '');
      setTags((data.tags || []).join(', '));
      setDeliveryTime(data.deliveryTime || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name) { setError('Farm name required'); return; }
    setLoading(true);
    setError('');
    try {
      await api.put('/farms', {
        name, description, city, address,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        deliveryTime,
      });
      router.back();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={22} color={colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.farmer.editFarm}</Text>

        {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <Input label={t.farmer.farmName} value={name} onChangeText={setName} placeholder="Green Valley Acres" />
        <Input label={t.farmer.farmDescription} value={description} onChangeText={setDescription} placeholder="Tell your farm's story..." multiline numberOfLines={4} />
        <Input label={t.farmer.farmCity} value={city} onChangeText={setCity} placeholder="Limuru" />
        <Input label={t.farmer.farmAddress} value={address} onChangeText={setAddress} placeholder="123 Farm Road" />
        <Input label={t.farmer.deliveryTime} value={deliveryTime} onChangeText={setDeliveryTime} placeholder="30-45 min" />
        <Input label={t.farmer.tags} value={tags} onChangeText={setTags} placeholder="Organic, Free-Range, Pasture Raised" />

        <Button
          title={t.common.save}
          onPress={handleSave}
          loading={loading}
          size="lg"
          icon={<Save size={20} color={colors.white} strokeWidth={2.5} />}
          style={{ marginTop: spacing.xxl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.sm },
  scroll: { paddingHorizontal: spacing.containerPadding, paddingBottom: 40 },
  title: { ...typography.headlineMd, fontWeight: '800', marginBottom: spacing.xxl },
  error: { ...typography.bodySm, marginBottom: spacing.md },
});
