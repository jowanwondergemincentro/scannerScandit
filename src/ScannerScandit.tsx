import React,{ Component, createElement } from "react";
import{ Alert,AppState } from "react-native";
//import { Style, mergeNativeStyles } from '@mendix/pluggable-widgets-tools';
//import { Badge } from "./components/Badge";
//import { BadgeStyle } from "./ui/styles";
//import { ScannerScanditProps } from "../typings/ScannerScanditProps";
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import {
  Brush,
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  Feedback,
  FrameSourceState,
  MeasureUnit,
  NumberWithUnit,
  RectangularViewfinder,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

// Set your license key.
//ScanditModule.setAppKey();
//export type Props = ScannerScanditProps<BadgeStyle>;
interface Scandit {
    dataCaptureContext?: DataCaptureContext;
    viewRef?: DataCaptureView;
    barcodeCapture?: BarcodeCapture;
    camera?: Camera;
    barcodeCaptureListener?: any;
    overlay: BarcodeCaptureOverlay;
}

export class ScannerScandit extends Component<Scandit> {
  scandit;
  constructor(props: Scandit) {
      super(props);
      // Create data capture context using your license key.
      this.scandit.dataCaptureContext = DataCaptureContext.forLicenseKey('Aawv+RI4MgB0EhR+jgn8qaAi8GllP2X6Ti7giLYSMMeLIjp73WsHAn5L90WnPLgn/zLiuWFrHdIqNHl1pmC/Zht7JRBLa2xEKyoUxCJlF+yOccR9jViUOm15WObcREYQM0yExu5i3ypqcidbjXjEYlBRFL95aPyTo1Drev5F/WnTSwAc52BUqmt2KQj1SpenZ3sQu0lZdnsUR6VdKWVFup5BU18heAUK5mKhYUJCwBIhZO26W0+P7+4XzvQvR2pwdUWLZTFtVOMYbBSjfEIO5o9YqJ7fS0BDsAxPqRtvTJOYVdJEp1Rq1h5u4AjyVdIpc0wRaiN5QfVJZnU0rkljsgJERCKkVJ+SOH/w269taL6pVpnUB1fp/X9DDuKUc39bWlswuYhmtO+Cdh9lzGHojkZskQYbIIIaBnpA8lBwAxZdR6j5rUCHlslB7fM+JZOSLHtqXrgtwx4MP1URsmGUc4lxdYSPS0LILw3bm9FEu6C0IKmDki9GmZNngyzlLFCKGBKokNMsU1G7J6pDVhbGgCowkEGR6AxjfuTZFkt+AKtmamywhJkx/ruNiKk53jTbZBHNKXUWlMv8BhvqHO8mkpntSj16/xGk1VBQJduMMXR+1HjvShPfDe6tLI2HcmGCgdDjFRTh+qmEp4RdBhZ9SL878PGes7wmDwC/EcXzpdpm6bHixAVSAzo4o8PJ7k5azhnl2Z34ZetbHtdOmOz23KXYVdzEaorXMPrDTuFkHDClR6xPcCK4EJDn+GCfhiAqZq6hZxCmDT4R1IUh9A9+etJFVRMnRW9hwbgKxZ7dVWCUyyPRxNpXC8smge5yNpJqZhyabBExcuxAgpk4ln5IRVYvzc/SHacMvWdO/KRTjAAalWq8cDtpe1KHHiGw/8tmGpqL5PBtn5gJWJDsecNJlV6Gc96aEYSAirOJTNgYksTdPdNN1C5aij4lsS51SQShdr2ke24jXEPnh6+aRj79hQR/w1DwhP0j8xD6Fwbf/FEjsQM3s1KQRxzMy4CYKeuAW0HQ7QpaLufYsyjIjRsPuFj0O/5+fpisxxp1GGcWU7iMlG4sVlZv1MK/fHs1rrXYbZxSEllLDHrJScV2jOXAjhSJCgVyoRQSwnHYDUqqQzVIIuFAyLfN9rvTKHgUVkXXDuqerJcQaKB8Nbhir26cKqk7gmyvgeJaeVoPZEbYvjiptUOBQV2MlMf0JpgHbcI=');
      this.scandit.viewRef = React.createRef();
    }

    componentDidMount() {
      AppState.addEventListener('change', this.handleAppStateChange);
      this.setupScanning();
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this.handleAppStateChange);
      this.scandit.dataCaptureContext.dispose();
    }

    handleAppStateChange = async (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        this.stopCapture();
      } else {
        this.startCapture();
      }
    }

    startCapture() {
      this.startCamera();
      this.scandit.barcodeCapture.isEnabled = true;
    }

    stopCapture() {
      this.scandit.barcodeCapture.isEnabled = false;
      this.stopCamera();
    }

    stopCamera() {
      if (this.scandit.camera) {
        this.scandit.camera.switchToDesiredState(FrameSourceState.Off);
      }
    }

    startCamera() {
      if (!this.scandit.camera) {
        // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
        // default and must be turned on to start streaming frames to the data capture context for recognition.
        this.scandit.camera = Camera.default;
        this.scandit.dataCaptureContext.setFrameSource(this.scandit.camera);

        const cameraSettings = new CameraSettings();
        cameraSettings.preferredResolution = VideoResolution.FullHD;
        this.scandit.camera.applySettings(cameraSettings);
      }
    }

    setupScanning() {
      // The barcode capturing process is configured through barcode capture settings
      // and are then applied to the barcode capture instance that manages barcode recognition.
      const settings = new BarcodeCaptureSettings();

      // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
      // sample we enable the QR symbology. In your own app ensure that you only enable the symbologies that your app
      // requires as every additional enabled symbology has an impact on processing times.
      settings.enableSymbologies([Symbology.QR,Symbology.Code128,Symbology.EAN8,Symbology.EAN13UPCA]);

      // Create new barcode capture mode with the settings from above.
      this.scandit.barcodeCapture = BarcodeCapture.forContext(this.scandit.dataCaptureContext, settings);

      // By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
      // In the following we are setting a success feedback without sound and vibration.
      this.scandit.barcodeCapture.feedback = { success: new Feedback(null, null) };

      // Register a listener to get informed whenever a new barcode got recognized.
      this.scandit.barcodeCaptureListener = {
        didScan: (_, session) => {
          const barcode = session.newlyRecognizedBarcodes[0];
          const symbology = new SymbologyDescription(barcode.symbology);

          // If the code scanned doesn't start with '09:', we will just ignore it and continue scanning.
          if (!barcode.data.startsWith('09:')) {
            return;
          }

          // Stop recognizing barcodes for as long as we are displaying the result. There won't be any
          // new results until the capture mode is enabled again. Note that disabling the capture mode
          // does not stop the camera, the camera continues to stream frames until it is turned off.
          this.scandit.barcodeCapture.isEnabled = false;

          Feedback.defaultFeedback.emit()

          Alert.alert("Scanned:"+ barcode.data + symbology.readableName);
        }
      };

      this.scandit.barcodeCapture.addListener(this.scandit.barcodeCaptureListener);

      // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
      // the video preview. This is optional, but recommended for better visual feedback.
      this.scandit.overlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(this.scandit.barcodeCapture, this.scandit.viewRef.current);
      this.scandit.overlay.brush = Brush.transparent;

      // Add a square viewfinder as we are only scanning square QR codes.
      const viewfinder = new RectangularViewfinder();
      viewfinder.setWidthAndAspectRatio(new NumberWithUnit(0.8, MeasureUnit.Fraction), 1);
      this.scandit.overlay.viewfinder = viewfinder;
    }

    render() {
      return (
        <DataCaptureView  context={this.scandit.dataCaptureContext} ref={this.scandit.viewRef} />
      );
    };


}
