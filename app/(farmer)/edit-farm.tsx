import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Save, Camera } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { pickImage, uploadFarmImage } from '../../services/upload';

export default function EditFarmScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoMime, setLogoMime] = useState<string | undefined>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farmId, setFarmId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/farms/my-farm').then(({ data }) => {
      setFarmId(data.id);
      setName(data.name);
      setDescription(data.description || '');
      setCity(data.city || '');
      setAddress(data.address || '');
      setTags((data.tags || []).join(', '));
      setDeliveryTime(data.deliveryTime || '');
      setLogo(data.logo || null);
    }).catch(() => {});
  }, []);

  const handlePickLogo = async () => {
    Alert.alert('Farm Logo', '', [
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await pickImage();
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setLogoUri(asset.uri);
            setLogoMime(asset.mimeType);
          }
        },
      },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name) { setError('Farm name required'); return; }
    setLoading(true);
    setError('');

    let logoUrl = logo;

    if (logoUri) {
      setUploadingLogo(true);
      try {
        logoUrl = await uploadFarmImage(logoUri, 'logo', logoMime);
      } catch (e: any) {
        setError(e.message || 'Failed to upload logo');
        setLoading(false);
        setUploadingLogo(false);
        return;
      }
      setUploadingLogo(false);
    }

    try {
      const payload: Record<string, any> = {
        name, description, city, address,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        deliveryTime,
      };
      if (logoUrl) payload.logo = logoUrl;
      if (farmId) {
        await api.put('/farms', payload);
      } else {
        await api.post('/farms', payload);
      }
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

        <TouchableOpacity style={[styles.logoPicker, { borderColor: colors.outline, backgroundColor: colors.surfaceContainerLow }]} onPress={handlePickLogo}>
          {logoUri || logo ? (
            <Image source={{ uri: (logoUri || logo) ?? undefined }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Camera size={28} color={colors.onSurfaceVariant} strokeWidth={1.5} />
              <Text style={[styles.logoPlaceholderText, { color: colors.onSurfaceVariant }]}>Farm Logo</Text>
            </View>
          )}
        </TouchableOpacity>

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
  logoPicker: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', alignSelf: 'center', marginBottom: spacing.xxl },
  logoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  logoPlaceholderText: { ...typography.bodySm },
});
