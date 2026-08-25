import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Formules d'abonnement. Les identifiants doivent correspondre exactement
/// aux produits créés dans la Play Console, sinon aucun prix ne remonte.
abstract final class PremiumProducts {
  static const annual = 'hikmaclips_premium_annual';
  static const monthly = 'hikmaclips_premium_monthly';

  static const all = <String>{annual, monthly};
}

/// Abonnement Premium via Google Play Billing.
///
/// Tant que les produits ne sont pas publiés dans la Play Console, le store
/// ne renvoie rien : l'écran affiche alors les prix indicatifs et l'achat
/// reste indisponible plutôt que d'échouer silencieusement.
class PremiumService extends ChangeNotifier {
  PremiumService._();

  static final PremiumService instance = PremiumService._();

  static const _premiumKey = 'premium_active';

  final InAppPurchase _iap = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  SharedPreferencesAsync? _preferences;

  SharedPreferencesAsync get _store =>
      _preferences ??= SharedPreferencesAsync();

  bool _isPremium = false;
  bool _storeAvailable = false;
  bool _loading = false;
  List<ProductDetails> _products = const [];

  bool get isPremium => _isPremium;
  bool get storeAvailable => _storeAvailable;
  bool get loading => _loading;
  List<ProductDetails> get products => _products;

  ProductDetails? get annual => _productById(PremiumProducts.annual);
  ProductDetails? get monthly => _productById(PremiumProducts.monthly);

  ProductDetails? _productById(String id) {
    for (final product in _products) {
      if (product.id == id) return product;
    }
    return null;
  }

  Future<void> initialize() async {
    try {
      _isPremium = await _store.getBool(_premiumKey) ?? false;
    } on Object {
      _isPremium = false;
    }
    notifyListeners();

    if (kIsWeb) return;

    try {
      _storeAvailable = await _iap.isAvailable();
    } on Object {
      _storeAvailable = false;
    }
    if (!_storeAvailable) {
      notifyListeners();
      return;
    }

    _subscription ??= _iap.purchaseStream.listen(
      _onPurchaseUpdated,
      onError: (_) {},
    );

    await loadProducts();
  }

  Future<void> loadProducts() async {
    if (!_storeAvailable) return;
    _loading = true;
    notifyListeners();

    try {
      final response = await _iap.queryProductDetails(PremiumProducts.all);
      _products = response.productDetails;
    } on Object {
      _products = const [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Lance l'achat. Renvoie false si le produit n'est pas disponible :
  /// l'appelant affiche alors un message plutôt qu'un écran figé.
  Future<bool> buy(ProductDetails? product) async {
    if (product == null || !_storeAvailable) return false;
    try {
      return await _iap.buyNonConsumable(
        purchaseParam: PurchaseParam(productDetails: product),
      );
    } on Object {
      return false;
    }
  }

  /// Restaure un abonnement déjà payé, par exemple après réinstallation.
  Future<void> restore() async {
    if (!_storeAvailable) return;
    try {
      await _iap.restorePurchases();
    } on Object {
      // Rien à restaurer.
    }
  }

  Future<void> _onPurchaseUpdated(List<PurchaseDetails> purchases) async {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.purchased ||
          purchase.status == PurchaseStatus.restored) {
        if (PremiumProducts.all.contains(purchase.productID)) {
          await _setPremium(true);
        }
      }

      // Obligatoire : sans cet appel Google Play rembourse automatiquement.
      if (purchase.pendingCompletePurchase) {
        await _iap.completePurchase(purchase);
      }
    }
  }

  Future<void> _setPremium(bool value) async {
    if (_isPremium == value) return;
    _isPremium = value;
    notifyListeners();
    await _store.setBool(_premiumKey, value);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
