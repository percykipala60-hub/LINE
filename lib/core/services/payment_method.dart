enum PaymentMethodType {
  mobileMoney,
  stripe,
}

enum MobileMoneyProvider {
  mpesa,
  airtelMoney,
  orangeMoney,
}

class PaymentResult {
  final bool success;
  final String? transactionId;
  final String? errorMessage;

  PaymentResult({
    required this.success,
    this.transactionId,
    this.errorMessage,
  });
}
