import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, Sprout, Package, ShoppingCart, User, LayoutDashboard, ClipboardList, Truck } from 'lucide-react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';

function TabIcon({ icon: Icon, focused }: { icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; focused: boolean }) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Icon size={22} color={focused ? colors.primary : colors.outline} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);

  const isFarmer = user?.role === 'FARMER';
  const isDriver = user?.role === 'DRIVER';

  const tabBarStyle = {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    elevation: 0,
    height: 60,
    paddingBottom: 4,
  };

  if (isDriver) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.outline,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="driver-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabIcon icon={Truck} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="driver-deliveries"
          options={{
            title: 'Deliveries',
            tabBarIcon: ({ focused }) => <TabIcon icon={Package} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="farms" options={{ href: null }} />
        <Tabs.Screen name="cart" options={{ href: null }} />
        <Tabs.Screen name="dashboard" options={{ href: null }} />
        <Tabs.Screen name="manage-products" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="addresses" options={{ href: null }} />
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="help" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>
    );
  }

  if (isFarmer) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.outline,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabIcon icon={LayoutDashboard} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="manage-products"
          options={{
            title: 'Products',
            tabBarIcon: ({ focused }) => <TabIcon icon={ClipboardList} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ focused }) => <TabIcon icon={Package} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="farms" options={{ href: null }} />
        <Tabs.Screen name="cart" options={{ href: null }} />
        <Tabs.Screen name="driver-dashboard" options={{ href: null }} />
        <Tabs.Screen name="driver-deliveries" options={{ href: null }} />
        <Tabs.Screen name="addresses" options={{ href: null }} />
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="help" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Farms',
          tabBarIcon: ({ focused }) => <TabIcon icon={Sprout} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon icon={Package} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabIcon icon={ShoppingCart} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
        }}
      />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="manage-products" options={{ href: null }} />
      <Tabs.Screen name="driver-dashboard" options={{ href: null }} />
      <Tabs.Screen name="driver-deliveries" options={{ href: null }} />
      <Tabs.Screen name="addresses" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: { ...typography.labelSm, fontSize: 11, fontWeight: '600' },
  tabIcon: { alignItems: 'center', justifyContent: 'center', width: 28, height: 28 },
  tabIconFocused: {},
});
