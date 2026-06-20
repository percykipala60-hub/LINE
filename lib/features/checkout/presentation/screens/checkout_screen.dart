import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../core/services/stripe_service.dart';
import '../../../../core/services/flexpay_service.dart';
import '../../../../core/services/payment_method.dart';
import '../widgets/payment_method_selector.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../cart/presentation/providers/cart_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipController = TextEditingController();
  final _countryController = TextEditingController(text: 'République Démocratique du Congo');
  final _phoneController = TextEditingController();
  PaymentMethodType _selectedMethod = PaymentMethodType.mobileMoney;
  MobileMoneyProvider _selectedMobileProvider = MobileMoneyProvider.mpesa;
  bool _isProcessing = false;

  @override
  void dispose() {
    _streetController.dispose();
    _cityController.dispose();
    _zipController.dispose();
    _countryController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _processPayment(double totalAmount, String userEmail, String userId) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isProcessing = true);

    try {
      final cartItems = ref.read(cartProvider).value ?? [];
      if (cartItems.isEmpty) {
        throw Exception('Votre panier est vide.');
      }

      // 1. Lancer le paiement (Stripe ou FlexPay)
      PaymentResult paymentResult;

      if (_selectedMethod == PaymentMethodType.stripe) {
        final isPaid = await StripeService.instance.stripePaymentFlow(
          amount: totalAmount,
          currency: 'usd',
          customerEmail: userEmail,
        );
        paymentResult = PaymentResult(
          success: isPaid,
          transactionId: isPaid ? 'stripe_mock_${DateTime.now().millisecondsSinceEpoch}' : null,
          errorMessage: isPaid ? null : 'Paiement Stripe annulé ou échoué.',
        );
      } else {
        paymentResult = await FlexPayService.instance.initMobileMoneyPayment(
          phone: _phoneController.text.trim(),
          amount: totalAmount,
          currency: 'USD',
          provider: _selectedMobileProvider,
        );
      }

      if (!paymentResult.success) {
        throw Exception(paymentResult.errorMessage ?? 'Paiement échoué.');
      }

      // 2. Préparer l'adresse de livraison
      final shippingAddress = {
        'street': _streetController.text.trim(),
        'city': _cityController.text.trim(),
        'zip_code': _zipController.text.trim(),
        'country': _countryController.text.trim(),
      };

      final supabase = ref.read(supabaseClientProvider);
      final cartId = cartItems.first.cartId;

      // 3. Créer la commande dans Supabase
      final order = await supabase.from('orders').insert({
        'user_id': userId,
        'total_amount': totalAmount,
        'payment_method': _selectedMethod.name,
        'payment_reference': paymentResult.transactionId ?? 'ref_${DateTime.now().millisecondsSinceEpoch}',
        'mobile_money_phone': _selectedMethod == PaymentMethodType.mobileMoney ? _phoneController.text.trim() : null,
        'shipping_address': shippingAddress,
        'status': 'paid',
      }).select().single();

      final String orderId = order['id'];

      // 4. Insérer les articles commandés (order_items)
      final orderItemsData = cartItems.map((item) {
        return {
          'order_id': orderId,
          'product_variant_id': item.productVariantId,
          'quantity': item.quantity,
          'price_at_purchase': item.product?.price ?? 0.0,
        };
      }).toList();

      await supabase.from('order_items').insert(orderItemsData);

      // 5. Vider le panier de l'utilisateur (cart_items)
      await supabase.from('cart_items').delete().eq('cart_id', cartId);

      // Rafraîchir l'état du panier Riverpod
      ref.invalidate(cartProvider);

      if (!mounted) return;
      
      // Alerte succès
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Commande Validée'),
            ],
          ),
          content: const Text('Merci pour votre achat ! Votre commande a été payée et enregistrée avec succès.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Fermer modal
                context.go('/'); // Retour au catalogue
              },
              child: const Text('Fermer'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors du paiement : ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cartAsync = ref.watch(cartProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Validation de Commande'),
      ),
      body: cartAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('Panier vide, impossible de commander.'));
          }

          final double total = items.fold(0.0, (sum, item) => sum + item.totalPrice);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Récapitulatif
                  Text('Récapitulatif de vos articles', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 16),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('${item.product?.name} (x${item.quantity})'),
                        subtitle: Text('Taille: ${item.variant?.size} | Couleur: ${item.variant?.color}'),
                        trailing: Text('${item.totalPrice.toStringAsFixed(2)} €', style: const TextStyle(fontWeight: FontWeight.bold)),
                      );
                    },
                  ),
                  const Divider(height: 32),

                  // 2. Adresse
                  Text('Adresse de livraison', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _streetController,
                    decoration: const InputDecoration(labelText: 'Rue / Avenue', border: OutlineInputBorder()),
                    validator: (val) => val == null || val.isEmpty ? 'Champ requis' : null,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _cityController,
                          decoration: const InputDecoration(labelText: 'Ville', border: OutlineInputBorder()),
                          validator: (val) => val == null || val.isEmpty ? 'Champ requis' : null,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _zipController,
                          decoration: const InputDecoration(labelText: 'Code Postal', border: OutlineInputBorder()),
                          validator: (val) => val == null || val.isEmpty ? 'Champ requis' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _countryController,
                    decoration: const InputDecoration(labelText: 'Pays', border: OutlineInputBorder()),
                    validator: (val) => val == null || val.isEmpty ? 'Champ requis' : null,
                  ),
                  const Divider(height: 32),

                  // 2.5. Méthode de paiement
                  PaymentMethodSelector(
                    selectedMethod: _selectedMethod,
                    onChanged: (method) => setState(() => _selectedMethod = method),
                    selectedMobileProvider: _selectedMobileProvider,
                    onMobileProviderChanged: (provider) => setState(() => _selectedMobileProvider = provider!),
                    phoneController: _phoneController,
                  ),
                  const Divider(height: 32),

                  // 3. Total & Bouton de paiement
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total à régler :', style: theme.textTheme.titleLarge),
                      Text(
                        '${total.toStringAsFixed(2)} €',
                        style: theme.textTheme.displayLarge?.copyWith(
                          fontSize: 24,
                          color: theme.colorScheme.tertiary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 54,
                    child: ElevatedButton(
                      onPressed: _isProcessing || user == null
                          ? null
                          : () => _processPayment(total, user.email ?? '', user.id),
                      child: _isProcessing
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(_selectedMethod == PaymentMethodType.stripe ? Icons.credit_card : Icons.phone_android),
                                const SizedBox(width: 8),
                                Text(_selectedMethod == PaymentMethodType.stripe ? 'Payer avec Stripe' : 'Payer avec Mobile Money'),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Erreur : $err')),
      ),
    );
  }
}
