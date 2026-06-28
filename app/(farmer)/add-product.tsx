import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Save, Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Chip from '../../components/ui/Chip';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { pickImage, uploadImage } from '../../services/upload';

const CATEGORIES = ['BROILER', 'LAYER', 'KROILER', 'NATIVE', 'DUCK', 'TURKEY', 'OTHER'];

export default function AddProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const isEdit = !!id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('BROILER');
  const [weight, setWeight] = useState('');
  const [inventory, setInventory] = useState('10');
  const [image, setImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        setName(data.name);
        setDescription(data.description || '');
        setPrice(String(data.price / 100));
        setCategory(data.category);
        setWeight(data.weight || '');
        setInventory(String(data.inventory));
        setImage(data.image || null);
      }).catch(() => {});
    }
  }, [id]);

  const handlePickImage = async () => {
    Alert.alert(t.farmer.productImage, '', [
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await pickImage();
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setImageUri(asset.uri);
            setImageMime(asset.mimeType);
          }
        },
      },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImage(null);
  };

  const handleSave = async () => {
    if (!name || !price) { setError('Name and price required'); return; }
    setLoading(true);
    setError('');

    let imageUrl = image;

    if (imageUri && !imageUrl?.startsWith('http')) {
      setUploadingImage(true);
      try {
        imageUrl = await uploadImage(imageUri, imageMime);
      } catch (e: any) {
        setError(e.message || 'Failed to upload image');
        setLoading(false);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    try {
      const payload: Record<string, any> = {
        name, description,
        price: Math.round(parseFloat(price) * 100),
        category, weight, inventory: parseInt(inventory) || 0,
      };
      if (imageUrl) payload.image = imageUrl;
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      router.back();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save product');
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
        <Text style={[styles.title, { color: colors.onSurface }]}>{isEdit ? t.farmer.editProduct : t.farmer.addProduct}</Text>

        {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        <TouchableOpacity style={[styles.imagePicker, { borderColor: colors.outline, backgroundColor: colors.surfaceContainerLow }]} onPress={handlePickImage}>
          {imageUri || image ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: (imageUri || image) ?? undefined }} style={styles.imagePreview} />
              <TouchableOpacity style={[styles.removeImage, { backgroundColor: colors.error }]} onPress={handleRemoveImage}>
                <Trash2 size={16} color={colors.white} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={32} color={colors.onSurfaceVariant} strokeWidth={1.5} />
              <Text style={[styles.imagePlaceholderText, { color: colors.onSurfaceVariant }]}>{t.farmer.productImage}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label={t.farmer.productName} value={name} onChangeText={setName} placeholder="e.g. Free-Range Eggs" />
        <Input label={t.farmer.farmDescription} value={description} onChangeText={setDescription} placeholder="Describe your product..." multiline numberOfLines={3} />
        <Input label={t.farmer.price} value={price} onChangeText={setPrice} placeholder="12.99" keyboardType="decimal-pad" />
        <Input label={t.farmer.weight} value={weight} onChangeText={setWeight} placeholder="e.g. 1kg, 12 pcs" />
        <Input label={t.farmer.inventory} value={inventory} onChangeText={setInventory} placeholder="10" keyboardType="number-pad" />

        <Text style={[styles.label, { color: colors.onSurface }]}>{t.farmer.category}</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((cat) => (
            <Chip key={cat} label={cat} active={category === cat} onPress={() => setCategory(cat)} />
          ))}
        </View>

        <Button
          title={isEdit ? t.farmer.editProduct : t.farmer.addProduct}
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
  label: { ...typography.labelMd, fontWeight: '700', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xxl },
  imagePicker: { width: '100%', height: 180, borderRadius: borderRadius.lg, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', marginBottom: spacing.lg },
  imagePreviewWrap: { width: '100%', height: '100%', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImage: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  imagePlaceholderText: { ...typography.bodyMd },
});
