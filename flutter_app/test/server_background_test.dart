import 'package:flutter_test/flutter_test.dart';
import 'package:hikmaclips/models/server_background.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('loads the unique Cloudinary server background catalog', () async {
    final backgrounds = await loadServerBackgrounds();

    expect(backgrounds, hasLength(50));
    expect(
      backgrounds.map((background) => background.imageUrl).toSet(),
      hasLength(50),
    );
    expect(
      backgrounds.every(
        (background) =>
            Uri.parse(background.imageUrl).host == 'res.cloudinary.com',
      ),
      isTrue,
    );
  });
}
