package fr.hikmatips.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Autorise la lecture automatique des vidéos (ex: vidéo de démarrage)
        // sans exiger une interaction utilisateur préalable dans la WebView.
        getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
}
