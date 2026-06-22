class AppUser {
  final String id;
  final String? email;
  final String? fullName;
  final String? avatarUrl;
  final String role; // 'user' or 'admin'
  final Map<String, dynamic>? billingAddress;
  final Map<String, dynamic>? shippingAddress;

  AppUser({
    required this.id,
    this.email,
    this.fullName,
    this.avatarUrl,
    required this.role,
    this.billingAddress,
    this.shippingAddress,
  });

  bool get isAdmin => role == 'admin';

  factory AppUser.fromJson(Map<String, dynamic> json, {String? email}) {
    return AppUser(
      id: json['id'] as String,
      email: email ?? json['email'] as String?,
      fullName: json['full_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      role: (json['role'] as String?) ?? 'user',
      billingAddress: json['billing_address'] as Map<String, dynamic>?,
      shippingAddress: json['shipping_address'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'avatar_url': avatarUrl,
      'role': role,
      'billing_address': billingAddress,
      'shipping_address': shippingAddress,
    };
  }
}
