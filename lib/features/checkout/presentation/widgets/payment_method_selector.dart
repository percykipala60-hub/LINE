import 'package:flutter/material.dart';
import '../../../../core/services/payment_method.dart';

class PaymentMethodSelector extends StatelessWidget {
  final PaymentMethodType selectedMethod;
  final ValueChanged<PaymentMethodType> onChanged;
  final MobileMoneyProvider? selectedMobileProvider;
  final ValueChanged<MobileMoneyProvider?>? onMobileProviderChanged;
  final TextEditingController? phoneController;

  const PaymentMethodSelector({
    super.key,
    required this.selectedMethod,
    required this.onChanged,
    this.selectedMobileProvider,
    this.onMobileProviderChanged,
    this.phoneController,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Mode de paiement', style: theme.textTheme.titleLarge),
        const SizedBox(height: 16),

        // Option Mobile Money (FlexPay)
        _buildPaymentOption(
          context: context,
          value: PaymentMethodType.mobileMoney,
          title: 'Mobile Money (RDC)',
          subtitle: 'M-Pesa, Airtel Money, Orange Money',
          icon: Icons.phone_android,
          isSelected: selectedMethod == PaymentMethodType.mobileMoney,
          onTap: () => onChanged(PaymentMethodType.mobileMoney),
        ),

        // Sous-options si Mobile Money est sélectionné
        if (selectedMethod == PaymentMethodType.mobileMoney) ...[
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.only(left: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Choisissez votre réseau :',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8.0,
                  children: MobileMoneyProvider.values.map((provider) {
                    final isSelected = selectedMobileProvider == provider;
                    return ChoiceChip(
                      label: Text(_getProviderName(provider)),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected && onMobileProviderChanged != null) {
                          onMobileProviderChanged!(provider);
                        }
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                if (phoneController != null)
                  TextFormField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Numéro de téléphone (ex: 081...)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.phone),
                    ),
                    validator: (val) {
                      if (val == null || val.isEmpty) {
                        return 'Veuillez entrer votre numéro';
                      }
                      if (val.length < 9) return 'Numéro invalide';
                      return null;
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Option Carte Bancaire (Stripe)
        _buildPaymentOption(
          context: context,
          value: PaymentMethodType.stripe,
          title: 'Carte Bancaire',
          subtitle: 'Visa, Mastercard, etc.',
          icon: Icons.credit_card,
          isSelected: selectedMethod == PaymentMethodType.stripe,
          onTap: () => onChanged(PaymentMethodType.stripe),
        ),
      ],
    );
  }

  Widget _buildPaymentOption({
    required BuildContext context,
    required PaymentMethodType value,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
          width: isSelected ? 2.0 : 1.0,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Icon(
                icon,
                size: 32,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.iconTheme.color,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(subtitle, style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
              Radio<PaymentMethodType>(
                value: value,
                groupValue: selectedMethod,
                onChanged: (val) {
                  if (val != null) onChanged(val);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getProviderName(MobileMoneyProvider provider) {
    switch (provider) {
      case MobileMoneyProvider.mpesa:
        return 'M-Pesa';
      case MobileMoneyProvider.airtelMoney:
        return 'Airtel Money';
      case MobileMoneyProvider.orangeMoney:
        return 'Orange Money';
    }
  }
}
