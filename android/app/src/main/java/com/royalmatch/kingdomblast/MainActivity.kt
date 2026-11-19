package com.royalmatch.kingdomblast

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Android back button is handled by Capacitor's App plugin via JavaScript bridge
    }
}
