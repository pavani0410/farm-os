class Plot {
  final int id;
  final String name;
  final String soilType;
  final double areaM2;
  final double areaAcres;
  final String polygonPoints;
  final Map<String, dynamic>? farm;

  Plot({
    required this.id,
    required this.name,
    required this.soilType,
    required this.areaM2,
    required this.areaAcres,
    required this.polygonPoints,
    this.farm,
  });

  factory Plot.fromJson(Map<String, dynamic> json) {
    return Plot(
      id: json['id'],
      name: json['name'],
      soilType: json['soilType'] ?? '',
      areaM2: (json['areaM2'] as num?)?.toDouble() ?? 0,
      areaAcres: (json['areaAcres'] as num?)?.toDouble() ?? 0,
      polygonPoints: json['polygonPoints'] ?? '[]',
      farm: json['farm'],
    );
  }
}