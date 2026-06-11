import 'dart:convert';
import 'package:http/http.dart' as http;

// your Spring Boot server address
// same as API_BASE_URL in React
const String baseUrl = 'http://localhost:8081/api';

class ApiService {

  // GET /api/farms
  static Future<List<dynamic>> getFarms() async {
    final response = await http.get(Uri.parse('$baseUrl/farms'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load farms');
  }

  // POST /api/farms
  static Future<Map<String, dynamic>> createFarm(Map<String, dynamic> farm) async {
    final response = await http.post(
      Uri.parse('$baseUrl/farms'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(farm),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to create farm');
  }

  // GET /api/farms/:id/plots
  static Future<List<dynamic>> getPlots(int farmId) async {
    final response = await http.get(Uri.parse('$baseUrl/farms/$farmId/plots'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load plots');
  }

  // POST /api/farms/:id/plots
  static Future<Map<String, dynamic>> createPlot(int farmId, Map<String, dynamic> plot) async {
    final response = await http.post(
      Uri.parse('$baseUrl/farms/$farmId/plots'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(plot),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to create plot');
  }
}