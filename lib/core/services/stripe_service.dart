import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

class StripeService {
  StripeService._();

  static final StripeService instance = StripeService._();

  // Initialiser la clé publique Stripe
  void init(String publishableKey) {
    Stripe.publishableKey = publishableKey;
    Stripe.merchantIdentifier = 'merchant.com.leen.app';
  }

  // Créer un Payment Intent en appelant une fonction serveur
  // (ex: une Supabase Edge Function sécurisée)
  Future<Map<String, dynamic>?> createPaymentIntent(double amount, String currency) async {
    try {
      // Simuler l'appel à votre backend. En production, remplacez cette URL par votre API/Supabase Edge Function.
      // Le backend doit appeler : stripe.paymentIntents.create({ amount, currency, customer })
      
      // Ici, nous simulons la réponse attendue pour le client
      final body = {
        'amount': (amount * 100).toInt().toString(), // Centimes
        'currency': currency,
        'paymentMethodTypes[]': 'card',
      };
      debugPrint('Simulation du corps de requête : $body');

      // Exemple d'appel :
      // final response = await http.post(
      //   Uri.parse('https://votre-projet.supabase.co/functions/v1/stripe-payment'),
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer VOTRE_SUPABASE_ANON_KEY',
      //   },
      //   body: jsonEncode(body),
      // );
      // return jsonDecode(response.body);

      // Pour l'intégration client, nous créons un mock de réussite contenant les clés requises.
      return {
        'client_secret': 'pi_mock_secret_${DateTime.now().millisecondsSinceEpoch}',
        'customer': 'cus_mock_12345',
        'ephemeral_key': 'ek_mock_12345',
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
          merchantDisplayName: 'Leen Store',
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
