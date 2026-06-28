import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, AppState } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Smartphone, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Order } from '../../types';

const POLL_INTERVAL = 3000;
const TIMEOUT_MS = 120000;

type PaymentStatus = 'sending' | 'sent' | 'processing' | 'success' | 'failed' | 'timeout';

export default function PaymentScreen() {
  const { id, phone, amount } = useLocalSearchParams<{ id: string; phone: string; amount: string }>();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [status, setStatus] = useState<PaymentStatus>('sending');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appState = useRef(AppState.currentState);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const checkPayment = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      const order: Order = res.data;
      if (order.snippePaymentStatus === 'completed') {
        setStatus('success');
        stopPolling();
      } else if (order.snippePaymentStatus === 'failed' || order.snippePaymentStatus === 'voided' || order.snippePaymentStatus === 'expired') {
        setStatus('failed');
        setErrorMsg(t.payment.failed);
        stopPolling();
      }
    } catch {
      setStatus('failed');
      setErrorMsg('Could not check payment status');
      stopPolling();
    }
  }, [id, stopPolling, t]);

  useEffect(() => {
    setStatus('sent');
    pollRef.current = setInterval(checkPayment, POLL_INTERVAL);
    timeoutRef.current = setTimeout(() => {
      setStatus('timeout');
      stopPolling();
    }, TIMEOUT_MS);
    return stopPolling;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkPayment();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [checkPayment]);

  const handleRetry = () => {
    setStatus('sending');
    setErrorMsg('');
    setTimeout(() => {
      setStatus('sent');
      pollRef.current = setInterval(checkPayment, POLL_INTERVAL);
      timeoutRef.current = setTimeout(() => {
        setStatus('timeout');
        stopPolling();
      }, TIMEOUT_MS);
    }, 1000);
  };

  const handleDone = () => {
    router.replace(`/order/${id}`);
  };

  const amountFormatted = amount ? `${(parseInt(amount) / 100).toLocaleString()} TSh` : '';
  const orderTotalFormatted = amountFormatted;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t.payment.payment}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {(status === 'sending' || status === 'sent' || status === 'processing') && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}>
              <Smartphone size={64} color={colors.primary} strokeWidth={1.5} />
            </View>

            <Text style={[styles.title, { color: colors.onSurface }]}>
              {status === 'sending' ? t.payment.paymentRequestSent : t.payment.paymentRequestSent}
            </Text>

            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t.payment.checkPhone}
            </Text>

            {phone && (
              <View style={[styles.phoneBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
                <Smartphone size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.phoneText, { color: colors.onSurface }]}>{phone}</Text>
              </View>
            )}

            <View style={[styles.amountBadge, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>{t.payment.amount}</Text>
              <Text style={[styles.amountValue, { color: colors.onSurface }]}>{orderTotalFormatted}</Text>
            </View>

            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
          </>
        )}

        {status === 'success' && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.success + '20' }]}>
              <CheckCircle size={64} color={colors.success} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]}>{t.payment.success}</Text>
            <View style={[styles.amountBadge, { backgroundColor: colors.success + '10' }]}>
              <Text style={[styles.amountLabel, { color: colors.onSurfaceVariant }]}>{t.payment.amount}</Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>{orderTotalFormatted}</Text>
            </View>
            <Button title="View Order" onPress={handleDone} size="lg" style={{ marginTop: spacing.xxl }} />
          </>
        )}

        {(status === 'failed' || status === 'timeout') && (
          <>
            <View style={[styles.iconWrap, { backgroundColor: colors.error + '20' }]}>
              {status === 'timeout' ? (
                <Clock size={64} color={colors.error} strokeWidth={1.5} />
              ) : (
                <XCircle size={64} color={colors.error} strokeWidth={1.5} />
              )}
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              {status === 'timeout' ? 'Payment Timed Out' : t.payment.failed}
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {errorMsg || (status === 'timeout' ? 'No payment confirmation received. Your order is still pending.' : '')}
            </Text>
            <View style={styles.actionButtons}>
              <Button title={t.payment.retry} onPress={handleRetry} size="lg" style={{ flex: 1 }} />
              <Button title="View Order" variant="outline" onPress={handleDone} size="lg" style={{ flex: 1 }} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.lg,
  },
  headerTitle: { ...typography.headlineMd, fontWeight: '800' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.containerPadding },
  iconWrap: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  title: { ...typography.headlineMd, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.bodyMd, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  phoneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, marginBottom: spacing.md,
  },
  phoneText: { ...typography.bodyMd, fontWeight: '700' },
  amountBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: borderRadius.lg, minWidth: 200,
  },
  amountLabel: { ...typography.bodyMd },
  amountValue: { ...typography.titleMd, fontWeight: '800' },
  actionButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl, width: '100%' },
});
