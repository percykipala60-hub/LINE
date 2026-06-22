import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'payment_method.dart';

class FlexPayService {
  FlexPayService._();

  static final FlexPayService instance = FlexPayService._();

  // ⚠️ Remplacer par vos vraies clés reçues de FlexPay (https://www.flexpay.cd)
  static const String _flexpayToken = 'VOTRE_TOKEN_DE_PRODUCTION_FLEXPAY';
  static const String _merchantId = 'VOTRE_MERCHANT_ID';

  /// Initie un paiement Mobile Money via USSD Push (Supporte Simulation + Production réelle)
  Future<PaymentResult> initMobileMoneyPayment({
    required String phone,
    required double amount,
    required String currency, // 'CDF' ou 'USD'
    required MobileMoneyProvider provider,
  }) async {
    // 1. Nettoyage et formatage du numéro de téléphone au format international (ex: 243xxxxxxxx)
    var cleanPhone = phone.replaceAll(RegExp(r'\s+'), '').replaceAll('+', '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '243${cleanPhone.substring(1)}';
    }
    
    if (cleanPhone.length < 12) {
      return PaymentResult(
        success: false, 
        errorMessage: 'Format de numéro invalide. Utilisez un format congolais (ex: 081234567 ou 24381234567).',
      );
    }

    // 2. Mode simulation/test par défaut si les clés de production n'ont pas encore été renseignées
    if (_flexpayToken == 'VOTRE_TOKEN_DE_PRODUCTION_FLEXPAY' || _merchantId == 'VOTRE_MERCHANT_ID') {
      debugPrint('--- FLEXPAY MODE SIMULATION ACTIF ---');
      debugPrint('Opérateur: ${provider.name}');
      debugPrint('Téléphone formaté: $cleanPhone');
      debugPrint('Montant: $amount $currency');
      debugPrint('--------------------------------------');
      
      await Future.delayed(const Duration(seconds: 3)); // Simule le temps de saisie du PIN par le client
      
      return PaymentResult(
        success: true,
        transactionId: 'flexpay_sim_${DateTime.now().millisecondsSinceEpoch}',
      );
    }

    // 3. Mode production réel (Appel direct aux APIs FlexPay)
    final url = Uri.parse('https://api.flexpay.cd/v1/merchant/pay');
    
    final body = {
      'merchant': _merchantId,
      'type': '1', // Type 1 pour mobile money
      'reference': 'order_${DateTime.now().millisecondsSinceEpoch}',
      'amount': amount.toString(),
      'currency': currency,
      'phone': cleanPhone,
      // URL qui recevra la notification de confirmation de FlexPay
      'callback_url': 'https://civqsllnrgkkocuvdlkt.supabase.co/functions/v1/flexpay-webhook',
    };

    try {
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $_flexpayToken',
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        
        // Code 0 ou flag success chez FlexPay indique la prise en compte du USSD Push
        if (data['code'] == '0' || data['success'] == true) {
          return PaymentResult(
            success: true,
            transactionId: data['orderNumber'] ?? data['transaction_id'] ?? 'flexpay_${DateTime.now().millisecondsSinceEpoch}',
          );
        } else {
          return PaymentResult(
            success: false,
            errorMessage: data['message'] ?? 'Demande refusée par l\'opérateur.',
          );
        }
      } else {
        return PaymentResult(
          success: false,
          errorMessage: 'Le serveur FlexPay a retourné une erreur (Code: ${response.statusCode}).',
        );
      }
    } catch (e) {
      return PaymentResult(
        success: false,
        errorMessage: 'Impossible de joindre le service de paiement FlexPay. Vérifiez votre connexion internet.',
      );
    }
  }
}
