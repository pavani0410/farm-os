import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/farms_screen.dart';
import 'screens/plots_screen.dart';
import 'screens/leaf_detection_screen.dart';

void main() {
  runApp(const FarmOSApp());
}

class FarmOSApp extends StatelessWidget {
  const FarmOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Farm OS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // dark theme base
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF020B18),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00D4FF),
          secondary: Color(0xFF00FF9D),
          surface: Color(0xFF050F1E),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const AppShell(),
    );
  }
}

// AppShell is the main layout with sidebar + content
// like your App.js in React
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  // tracks which screen is showing
  // 0=dashboard, 1=farms, 2=plots, 3=leaf
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    FarmsScreen(),
    PlotsScreen(),
    LeafDetectionScreen(),
  ];

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.dashboard_outlined, label: 'Dashboard'),
    _NavItem(icon: Icons.agriculture_outlined, label: 'Farms'),
    _NavItem(icon: Icons.map_outlined, label: 'Plots'),
    _NavItem(icon: Icons.biotech_outlined, label: 'Leaf AI'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // sidebar
          _Sidebar(
            selectedIndex: _selectedIndex,
            navItems: _navItems,
            onItemTapped: (index) => setState(() => _selectedIndex = index),
          ),
          // main content
          Expanded(
            child: _screens[_selectedIndex],
          ),
        ],
      ),
    );
  }
}

// nav item data class
class _NavItem {
  final IconData icon;
  final String label;
  const _NavItem({required this.icon, required this.label});
}

// sidebar widget
class _Sidebar extends StatelessWidget {
  final int selectedIndex;
  final List<_NavItem> navItems;
  final Function(int) onItemTapped;

  const _Sidebar({
    required this.selectedIndex,
    required this.navItems,
    required this.onItemTapped,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: const Color(0xFF030C1A),
        border: Border(
          right: BorderSide(
            color: const Color(0xFF00D4FF).withOpacity(0.15),
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // logo
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: const Color(0xFF00D4FF).withOpacity(0.15),
                ),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF00FF9D),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00FF9D).withOpacity(0.6),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'FARM OS',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF00D4FF),
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // nav items
          ...navItems.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            final isActive = index == selectedIndex;

            return GestureDetector(
              onTap: () => onItemTapped(index),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isActive
                      ? const Color(0xFF00D4FF).withOpacity(0.08)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(4),
                  border: Border(
                    left: BorderSide(
                      color: isActive
                          ? const Color(0xFF00D4FF)
                          : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      item.icon,
                      size: 16,
                      color: isActive
                          ? const Color(0xFF00D4FF)
                          : const Color(0xFF7BA0C8).withOpacity(0.6),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      item.label,
                      style: TextStyle(
                        fontSize: 12,
                        color: isActive
                            ? const Color(0xFF00D4FF)
                            : const Color(0xFF7BA0C8).withOpacity(0.7),
                        fontWeight: isActive
                            ? FontWeight.w500
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

          const Spacer(),

          // user chip at bottom
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: const Color(0xFF00D4FF).withOpacity(0.15),
                ),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 28, height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.4)),
                    color: const Color(0xFF00D4FF).withOpacity(0.08),
                  ),
                  child: const Center(
                    child: Text('FM',
                      style: TextStyle(
                        fontSize: 9, fontWeight: FontWeight.w700,
                        color: Color(0xFF00D4FF),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Farm Manager',
                      style: TextStyle(fontSize: 11, color: Color(0xFFE8F4FF)),
                    ),
                    Text('Karnataka',
                      style: TextStyle(fontSize: 10, color: Color(0xFF4A7A9B)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}