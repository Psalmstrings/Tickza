import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera, CameraOff, RefreshCw, Zap, ZapOff,
  AlertCircle, Video, CheckCircle2, SwitchCamera,
  Upload, Image as ImageIcon
} from 'lucide-react';

const CONTAINER_ID = 'tickza-camera-qr-reader';

export default function CameraQRScanner({
  onScan,
  active = true,
  paused = false,
  autoStart = false,
}) {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [isScanning, setIsScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const fileInputRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Audio & Haptic Feedback
  const playFeedback = useCallback((success = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (success) {
          // Double chime (high pitch, clear)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } else {
          // Buzz (low warning)
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      }
    } catch (e) {
      // AudioContext policy
    }

    if (navigator.vibrate) {
      try {
        navigator.vibrate(success ? [80, 40, 80] : [200, 100, 200]);
      } catch (e) {}
    }
  }, []);

  // Enumerate cameras
  const discoverCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Look for rear/environment camera label
        const backCam = devices.find((d) =>
          /back|rear|environment|wide|main/i.test(d.label || '')
        );
        if (backCam) {
          setSelectedCameraId(backCam.id);
        } else if (!selectedCameraId) {
          setSelectedCameraId(devices[0].id);
        }
      }
    } catch (err) {
      // Camera discovery failure before permissions is normal on iOS
      console.warn('[Camera Discovery Warning]', err?.message || err);
    }
  }, [selectedCameraId]);

  useEffect(() => {
    discoverCameras();
  }, [discoverCameras]);

  // Helper to ensure Html5Qrcode instance
  const getScannerInstance = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(CONTAINER_ID, {
        verbose: false,
        useBarCodeDetectorIfSupported: true,
      });
    }
    return scannerRef.current;
  };

  // Start Camera Scanning with Intelligent Multi-Stage Hardware Fallback
  const startCamera = async (overrideFacingMode, overrideCameraId) => {
    if (starting) return;

    setStarting(true);
    setErrorMessage('');

    // If an existing stream was running, cleanly stop it first
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {}
    }

    const scanner = getScannerInstance();

    const attemptStartWithConfig = async (config) => {
      return await scanner.start(
        config,
        { fps: 10 },
        (decodedText, decodedResult) => {
          if (pausedRef.current) return;
          const now = Date.now();
          if (decodedText === lastScanned && now - lastScanTimeRef.current < 2500) {
            return;
          }
          lastScanTimeRef.current = now;
          setLastScanned(decodedText);
          playFeedback(true);
          if (onScan) {
            onScan(decodedText, decodedResult);
          }
        },
        () => {}
      );
    };

    let started = false;
    let lastError = null;

    // Strategy 1: Explicit device ID if provided or previously selected
    const targetCamId = overrideCameraId !== undefined ? overrideCameraId : selectedCameraId;
    if (targetCamId) {
      try {
        await attemptStartWithConfig(targetCamId);
        started = true;
      } catch (err) {
        lastError = err;
        console.warn('[Camera ID failed, falling back]', err);
      }
    }

    // Strategy 2: Desired facingMode (environment / rear camera)
    if (!started) {
      const mode = overrideFacingMode || facingMode || 'environment';
      try {
        await attemptStartWithConfig({ facingMode: mode });
        started = true;
      } catch (err) {
        lastError = err;
        console.warn(`[Camera facingMode ${mode} failed, falling back]`, err);
      }
    }

    // Strategy 3: Alternative facingMode (user / front camera / laptop webcam)
    if (!started) {
      const altMode = facingMode === 'environment' ? 'user' : 'environment';
      try {
        await attemptStartWithConfig({ facingMode: altMode });
        setFacingMode(altMode);
        started = true;
      } catch (err) {
        lastError = err;
        console.warn(`[Camera alt facingMode ${altMode} failed, falling back]`, err);
      }
    }

    // Strategy 4: Direct device enumeration fallback
    if (!started) {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await attemptStartWithConfig(devices[0].id);
          setSelectedCameraId(devices[0].id);
          started = true;
        }
      } catch (err) {
        lastError = err;
        console.warn('[Camera devices fallback failed]', err);
      }
    }

    if (started) {
      isScanningRef.current = true;
      setIsScanning(true);
      setErrorMessage('');

      // Refresh camera list now that permission is active
      discoverCameras();

      // Check for torch capability
      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        setHasTorch(Boolean(capabilities && capabilities.torch));
      } catch (e) {
        setHasTorch(false);
      }
    } else {
      isScanningRef.current = false;
      setIsScanning(false);

      const errString = typeof lastError === 'string'
        ? lastError
        : (lastError?.message || lastError?.name || String(lastError || ''));

      if (errString.includes('NotAllowedError') || errString.includes('Permission') || errString.includes('denied')) {
        setErrorMessage('Camera access was blocked by your browser. Please tap the lock / camera icon in your browser address bar and select "Allow", then click Start Camera.');
      } else if (errString.includes('NotFoundError') || errString.includes('DevicesNotFoundError')) {
        setErrorMessage('No camera hardware was detected on this device. You can type or paste the Ticket ID manually below.');
      } else if (errString.includes('NotReadableError') || errString.includes('TrackStartError')) {
        setErrorMessage('Camera is currently in use by another tab or app. Please close other camera apps and retry.');
      } else {
        setErrorMessage(
          errString
            ? `Camera notice: ${errString}. Please verify permissions or enter Ticket ID manually below.`
            : 'Could not access device camera. Please check camera permissions in your browser address bar.'
        );
      }
    }

    setStarting(false);
  };

  // Stop Camera Scanning
  const stopCamera = async () => {
    if (!scannerRef.current || !isScanningRef.current) {
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
    } catch (err) {
      console.warn('[Stop Camera Warning]', err);
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
      setTorchOn(false);
      setHasTorch(false);
    }
  };

  // Flip Camera (Toggle environment <-> user)
  const flipCamera = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedCameraId(''); // reset specific ID so facingMode is honored

    if (isScanning) {
      await stopCamera();
      setTimeout(() => {
        startCamera(nextFacing, '');
      }, 150);
    }
  };

  // Switch specific camera
  const handleCameraChange = async (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (isScanning) {
      await stopCamera();
      setTimeout(() => {
        startCamera(facingMode, newId);
      }, 150);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('[Torch Error]', err);
    }
  };

  // Handle Photo/Screenshot File Upload Scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage('');

    try {
      const scanner = getScannerInstance();
      const decodedText = await scanner.scanFile(file, true);
      playFeedback(true);
      setLastScanned(decodedText);
      if (onScan) {
        onScan(decodedText, { source: 'file' });
      }
    } catch (err) {
      playFeedback(false);
      setErrorMessage('Could not find a valid QR code in the uploaded image. Please try a clearer photo.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isScanning && !starting) {
      startCamera();
    }
  }, [autoStart]);

  // Clean unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current.stop().catch(() => {});
        isScanningRef.current = false;
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Scanner Viewport / Video Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '1 / 1',
          minHeight: '260px',
          maxHeight: '380px',
          backgroundColor: '#070B19',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isScanning
            ? '0 10px 30px rgba(16, 185, 129, 0.25), 0 0 0 2px #10B981'
            : '0 8px 24px rgba(11, 16, 38, 0.12), 0 0 0 1px #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        {/* html5-qrcode target container - NEVER display:none so layout calculations never fail */}
        <div
          id={CONTAINER_ID}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            visibility: isScanning ? 'visible' : 'hidden',
          }}
        />

        {/* Global style override for html5-qrcode video */}
        <style>{`
          #${CONTAINER_ID} {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #${CONTAINER_ID} video {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            border-radius: 14px;
          }
          #${CONTAINER_ID}__scan_region {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        `}</style>

        {/* Inactive Overlay (When camera is off) */}
        {!isScanning && !starting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              backgroundColor: '#0B1026',
              zIndex: 4,
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
              }}
            >
              <Camera size={34} />
            </div>
            <div>
              <p style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '15px', margin: '0 0 6px' }}>
                Camera Scanner Ready
              </p>
              <p style={{ color: '#94A3B8', fontSize: '12.5px', margin: 0, maxWidth: '260px', lineHeight: 1.4 }}>
                Instant gate validation for smartphones, webcams & laser readers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => startCamera()}
              style={{
                marginTop: '4px',
                padding: '10px 20px',
                borderRadius: '999px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Camera size={16} /> Tap to Open Camera
            </button>
          </div>
        )}

        {/* Starting Spinner */}
        {starting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#0B1026',
              color: '#FFFFFF',
              zIndex: 5,
            }}
          >
            <RefreshCw size={32} className="animate-spin" color="#10B981" />
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, fontWeight: 600 }}>
              Connecting to camera hardware…
            </p>
          </div>
        )}

        {/* Visual Target Frame & Animated Scanline when scanning */}
        {isScanning && (
          <>
            {/* Viewfinder target box */}
            <div
              style={{
                position: 'absolute',
                width: '70%',
                height: '70%',
                maxWidth: '240px',
                maxHeight: '240px',
                pointerEvents: 'none',
                zIndex: 6,
              }}
            >
              <div className="org-scanner-corner tl" style={{ borderColor: '#10B981', width: 28, height: 28 }} />
              <div className="org-scanner-corner tr" style={{ borderColor: '#10B981', width: 28, height: 28 }} />
              <div className="org-scanner-corner bl" style={{ borderColor: '#10B981', width: 28, height: 28 }} />
              <div className="org-scanner-corner br" style={{ borderColor: '#10B981', width: 28, height: 28 }} />
              <div
                style={{
                  position: 'absolute',
                  left: '6px',
                  right: '6px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)',
                  boxShadow: '0 0 10px #10B981',
                  animation: 'orgScanline 2s ease-in-out infinite',
                }}
              />
            </div>

            {/* Active Scanning Indicator Pill */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.92)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(6px)',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  animation: 'pulse 1s infinite',
                }}
              />
              {facingMode === 'environment' ? 'REAR CAMERA' : 'FRONT CAMERA'}
            </div>

            {/* Action buttons inside camera view (Flip Camera & Torch) */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 10,
              }}
            >
              {/* Torch Toggle */}
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  aria-label="Toggle Flashlight"
                  style={{
                    backgroundColor: torchOn ? '#F59E0B' : 'rgba(0, 0, 0, 0.6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {torchOn ? <ZapOff size={18} /> : <Zap size={18} />}
                </button>
              )}

              {/* Quick Flip Camera Button */}
              <button
                type="button"
                onClick={flipCamera}
                aria-label="Flip Camera"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <SwitchCamera size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            marginTop: '12px',
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Camera Controls & Selector Bar */}
      <div
        style={{
          marginTop: '12px',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Primary Start / Stop Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => (isScanning ? stopCamera() : startCamera())}
            disabled={starting}
            style={{
              flex: 1,
              minHeight: '46px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isScanning ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: starting ? 'wait' : 'pointer',
              boxShadow: isScanning
                ? '0 2px 10px rgba(239, 68, 68, 0.25)'
                : '0 2px 10px rgba(16, 185, 129, 0.25)',
              touchAction: 'manipulation',
            }}
          >
            {starting ? (
              <>
                <RefreshCw size={17} className="animate-spin" /> Starting Camera…
              </>
            ) : isScanning ? (
              <>
                <CameraOff size={17} /> Stop Camera
              </>
            ) : (
              <>
                <Camera size={17} /> Start Camera Scanner
              </>
            )}
          </button>

          {/* Flip Camera Button */}
          <button
            type="button"
            onClick={flipCamera}
            disabled={starting}
            title="Switch front / rear camera"
            style={{
              width: '46px',
              minHeight: '46px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              touchAction: 'manipulation',
            }}
          >
            <SwitchCamera size={18} />
          </button>
        </div>

        {/* Secondary: Device Dropdown & Photo Upload option */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          {/* Specific Camera Dropdown (if multiple named cameras exist) */}
          {cameras.length > 1 && cameras.some((c) => c.label) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '180px' }}>
              <Video size={14} color="#64748B" style={{ flexShrink: 0 }} />
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {cameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fallback Image / Screenshot Scanner Button */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#4F46E5',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#EEF2FF',
              fontWeight: 600,
              marginLeft: 'auto',
              touchAction: 'manipulation',
            }}
          >
            {isProcessingFile ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            <span>Scan from Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isProcessingFile}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
