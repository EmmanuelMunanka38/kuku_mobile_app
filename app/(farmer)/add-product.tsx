import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Chip from '../../components/ui/Chip';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';

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
      }).catch(() => {});
    }
  }, [id]);

  const handleSave = async () => {
    if (!name || !price) { setError('Name and price required'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name, description,
        price: Math.round(parseFloat(price) * 100),
        category, weight, inventory: parseInt(inventory) || 0,
      };
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
});
