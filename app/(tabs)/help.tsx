import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HelpCircle, Mail, MessageCircle } from 'lucide-react-native';
import Card from '../../components/ui/Card';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse products, add items to your cart, and proceed to checkout. You\'ll receive a confirmation once your order is placed.' },
  { q: 'How does delivery work?', a: 'Farmers prepare your order fresh. Delivery times vary by farm. You can track your order status from the Orders tab.' },
  { q: 'Can I cancel an order?', a: 'Yes, you can cancel an order while it\'s still in PENDING or CONFIRMED status. Once shipped, cancellations may not be possible.' },
  { q: 'How are prices listed?', a: 'All prices are in Tanzanian Shillings (TSH) and include applicable taxes. Delivery fees are shown at checkout.' },
  { q: 'Is the poultry fresh?', a: 'Yes! All poultry is sourced directly from local farms and prepared fresh. We guarantee farm-to-table freshness.' },
  { q: 'How do I become a farmer?', a: 'Register as a Farmer, create your farm profile, and start listing your products. It\'s free to join KukuMart.' },
];

export default function HelpScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.profile.helpSupport}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Frequently asked questions</Text>
      </View>

      <View style={styles.list}>
        {faqs.map((faq, i) => (
          <Card key={i} variant="elevated" style={styles.faqCard}>
            <Text style={[styles.question, { color: colors.onSurface }]}>{faq.q}</Text>
            <Text style={[styles.answer, { color: colors.onSurfaceVariant }]}>{faq.a}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.contactCard}>
        <HelpCircle size={24} color={colors.primary} strokeWidth={2} />
        <Text style={[styles.contactTitle, { color: colors.onSurface }]}>Need more help?</Text>
        <View style={styles.contactRow}>
          <Mail size={16} color={colors.onSurfaceVariant} strokeWidth={2} />
          <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>support@kukumart.com</Text>
        </View>
        <View style={styles.contactRow}>
          <MessageCircle size={16} color={colors.onSurfaceVariant} strokeWidth={2} />
          <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>+255 712 345 678</Text>
        </View>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.xxl },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.containerPadding },
  faqCard: { marginBottom: spacing.md },
  question: { ...typography.titleMd, fontWeight: '700', marginBottom: spacing.sm },
  answer: { ...typography.bodyMd, lineHeight: 22 },
  contactCard: { marginHorizontal: spacing.containerPadding, marginTop: spacing.xxl, alignItems: 'center', gap: spacing.md, padding: spacing.xxl },
  contactTitle: { ...typography.titleMd, fontWeight: '700' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contactText: { ...typography.bodyMd },
});
