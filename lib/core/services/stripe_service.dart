import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;

class StripeService {
  StripeService._();

  static final StripeService instance = StripeService._();

  // Initialiser la clé publique Stripe
  void init(String publishableKey) {
    Stripe.publishableKey = publishableKey;
    Stripe.merchantIdentifier = 'merchant.com.leen.app';
  }

  // Créer un Payment Intent
  // TODO: WARNING - DÉPLACER CECI CÔTÉ SERVEUR POUR LA PRODUCTION (Ex: Supabase Edge Function)
  // Utiliser la clé secrète côté client expose votre compte Stripe. À utiliser UNIQUEMENT pour ce test.
  Future<Map<String, dynamic>?> createPaymentIntent(double amount, String currency) async {
    try {
      final String secretKey = 'sk_test_51TkDtL00389LZDsb16ADe47fOvYuBBGRzDS87mXxMkRzOCrhy6r79kAtnxVyuRxGXQCxVGgZRQu1ZOFYECXPMv3X00lMefxsPT';

      final body = {
        'amount': (amount * 100).toInt().toString(), // Centimes
        'currency': currency,
        'payment_method_types[]': 'card', // Important : format URL-encoded
      };

      final response = await http.post(
        Uri.parse('https://api.stripe.com/v1/payment_intents'),
        headers: {
          'Authorization': 'Bearer $secretKey',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode != 200) {
        debugPrint('Erreur Stripe API: ${responseData['error']['message']}');
        return null;
      }

      return {
        'client_secret': responseData['client_secret'],
        'customer': '', // Mock ou création d'un customer Stripe réel
        'ephemeral_key': '',
      };
    } catch (err) {
      debugPrint('Erreur lors de la création du PaymentIntent: $err');
      return null;
    }
  }

  // Présenter l'interface de paiement Stripe native (Payment Sheet)
  Future<bool> stripePaymentFlow({
    required double amount,
    required String currency,
    required String customerEmail,
  }) async {
    try {
      // 1. Demander le client secret au serveur
      final paymentData = await createPaymentIntent(amount, currency);
      if (paymentData == null) return false;

      // 2. Initialiser le Payment Sheet de Stripe
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: paymentData['client_secret'],
          merchantDisplayName: 'Line Store',
          customerId: paymentData['customer'],
          customerEphemeralKeySecret: paymentData['ephemeral_key'],
          style: ThemeMode.system,
          billingDetails: BillingDetails(
            email: customerEmail,
          ),
        ),
      );

      // 3. Afficher le Payment Sheet à l'écran
      await Stripe.instance.presentPaymentSheet();
      
      // 4. Succès du paiement
      return true;
    } on StripeException catch (e) {
      // Annulation ou erreur Stripe
      debugPrint('Erreur Stripe: ${e.error.localizedMessage}');
      return false;
    } catch (e) {
      debugPrint('Erreur inattendue: $e');
      return false;
    }
  }
}
