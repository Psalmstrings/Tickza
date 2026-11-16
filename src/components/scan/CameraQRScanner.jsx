import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, Zap, ZapOff, AlertCircle, Video, CheckCircle2 } from 'lucide-react';

export default function CameraQRScanner({ onScan, active = true, onToggleActive }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const containerId = 'tickza-camera-qr-reader';

  // Audio & Haptic Feedback
  const playBeep = (success = true) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext policy
    }

    if (navigator.vibrate) {
      try {
        navigator.vibrate(success ? 120 : [100, 50, 100]);
      } catch (e) {}
    }
  };

  // Discover connected cameras on mount
  useEffect(() => {
    let isMounted = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera on phones, fallback to first device (webcam on desktop)
          const backCam = devices.find((d) =>
            /back|rear|environment|wide/i.test(d.label || '')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameras([]);
        }
      })
      .catch((err) => {
        console.warn('[Camera Discovery Warning]', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Start Camera Scanning
  const startCamera = async (cameraIdToUse) => {
    if (isScanningRef.current || starting) return;

    setStarting(true);
    setErrorMessage('');

    try {
      // Instantiate scanner if needed
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId, {
          verbose: false,
        });
      }

      // Camera config: either specific camera ID or environment facingMode
      const cameraConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.floor(edge * 0.72),
            height: Math.floor(edge * 0.72),
          };
        },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        cameraConfig,
        qrConfig,
        (decodedText, decodedResult) => {
          // Debounce rapid continuous frame scans (1.8s delay between same code)
          const now = Date.now();
          if (decodedText === lastScanned && now - lastScanTimeRef.current < 2500) {
            return;
          }
          lastScanTimeRef.current = now;
          setLastScanned(decodedText);
          playBeep(true);

          if (onScan) {
            onScan(decodedText, decodedResult);
          }
        },
        () => {
          // Frame scanned without code detected (normal polling, no action needed)
        }
      );

      isScanningRef.current = true;
      setIsScanning(true);

      // Check for torch capability
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      } catch (e) {
        setHasTorch(false);
      }
    } catch (err) {
      console.error('[Start Camera Error]', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.message?.includes('Permission');
      const isNotFound = err?.name === 'NotFoundError' || err?.message?.includes('Requested device not found');
      
      if (isDenied) {
        setErrorMessage('Camera access was blocked. Please grant camera permissions in your browser address bar.');
      } else if (isNotFound) {
        setErrorMessage('No camera found on this device. You can enter or paste the QR token manually.');
      } else {
        setErrorMessage(err?.message || 'Could not start camera video stream.');
      }
      isScanningRef.current = false;
      setIsScanning(false);
    } finally {
      setStarting(false);
    }
  };

  // Stop Camera Scanning
  const stopCamera = async () => {
    if (!scannerRef.current || !isScanningRef.current) {
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
      isScanningRef.current = false;
      setIsScanning(false);
      setTorchOn(false);
      setHasTorch(false);
    } catch (err) {
      console.warn('[Stop Camera Warning]', err);
      isScanningRef.current = false;
      setIsScanning(false);
    }
  };

  // Switch Camera Device
  const handleCameraChange = async (e) => {
    const newCameraId = e.target.value;
    setSelectedCameraId(newCameraId);
    if (isScanning) {
      await stopCamera();
      setTimeout(() => {
        startCamera(newCameraId);
      }, 200);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current.stop().catch(() => {});
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
          maxWidth: '340px',
          height: '260px',
          backgroundColor: '#0B1026',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(11, 16, 38, 0.15)',
          border: isScanning ? '2px solid #10B981' : '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* html5-qrcode target container */}
        <div
          id={containerId}
          style={{
            width: '100%',
            height: '100%',
            display: isScanning ? 'block' : 'none',
            overflow: 'hidden',
          }}
        />
        <style>{`
          #${containerId} video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 12px !important;
          }
        `}</style>

        {/* Inactive Placeholder when camera is off */}
        {!isScanning && (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
              }}
            >
              <Camera size={32} />
            </div>
            <div>
              <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>
                Camera is Idle
              </p>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Works on phone cameras, device webcams, and external USB scanners.
              </p>
            </div>
          </div>
        )}

        {/* Visual Target Frame & Animated Scanline when scanning */}
        {isScanning && (
          <>
            <div className="org-scanner-corner tl" style={{ borderColor: '#10B981' }} />
            <div className="org-scanner-corner tr" style={{ borderColor: '#10B981' }} />
            <div className="org-scanner-corner bl" style={{ borderColor: '#10B981' }} />
            <div className="org-scanner-corner br" style={{ borderColor: '#10B981' }} />
            <div
              style={{
                position: 'absolute',
                left: '20px',
                right: '20px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
                boxShadow: '0 0 8px #10B981',
                animation: 'orgScanline 2.2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Active Scanning Indicator Pill */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.92)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
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
            LIVE CAMERA SCANNING
          </div>
        )}

        {/* Flashlight button inside camera frame if available */}
        {isScanning && hasTorch && (
          <button
            type="button"
            onClick={toggleTorch}
            aria-label="Toggle Flashlight"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: torchOn ? '#F59E0B' : 'rgba(0, 0, 0, 0.6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            {torchOn ? <ZapOff size={16} /> : <Zap size={16} />}
          </button>
        )}
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          style={{
            marginTop: '12px',
            width: '100%',
            maxWidth: '340px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px 12px',
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
          marginTop: '14px',
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Start / Stop Toggle Button */}
        <button
          type="button"
          onClick={() => (isScanning ? stopCamera() : startCamera(selectedCameraId))}
          disabled={starting}
          style={{
            width: '100%',
            minHeight: '44px',
            borderRadius: '8px',
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
            transition: 'background-color 0.15s ease',
            boxShadow: isScanning
              ? '0 2px 8px rgba(239, 68, 68, 0.25)'
              : '0 2px 8px rgba(16, 185, 129, 0.25)',
          }}
        >
          {starting ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Starting Camera…
            </>
          ) : isScanning ? (
            <>
              <CameraOff size={16} /> Stop Camera Scanner
            </>
          ) : (
            <>
              <Camera size={16} /> Start Camera Scanner
            </>
          )}
        </button>

        {/* Camera Selector (Phone Back/Front or Webcams) */}
        {cameras.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
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
      </div>
    </div>
  );
}
