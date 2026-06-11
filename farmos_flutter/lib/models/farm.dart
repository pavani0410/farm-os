// this is like a TypeScript interface or Python dataclass
// describes what a Farm object looks like
class Farm {
  final int id;
  final String name;
  final double acres;
  final String location;

  Farm({
    required this.id,
    required this.name,
    required this.acres,
    required this.location,
  });

  // converts JSON from Spring Boot into a Farm object
  // like parsing response.data in React
  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: json['id'],
      name: json['name'],
      acres: (json['acres'] as num).toDouble(),
      location: json['location'] ?? '',
    );
  }

  // converts Farm object back to JSON for sending to Spring Boot
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'acres': acres,
      'location': location,
    };
  }
}