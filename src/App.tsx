import React, { useEffect, useState } from "react";
import Quagga from "@ericblade/quagga2";

export const App: React.FC = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [detectedCode, setDetectedCode] = useState<string | null>("");
  const [inputSource, setInputSource] = useState("");
  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(devices);
    };
    getDevices();
  }, []);
  useEffect(() => {
    Quagga.init(
      {
        locate: true,
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.getElementById("quagga") as Element,
          constraints: {
            width: 640,
            height: 480,
            deviceId: inputSource,
          },
        },
        decoder: {
          readers: ["ean_reader"],
          multiple: false,
        },
        locator: {
          halfSample: true,
          patchSize: "medium",
        },
      },
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
      }
    );
    Quagga.onDetected((data) => {
      console.log(data.codeResult.code);
      setDetectedCode(data.codeResult.code);
    });
  }, [inputSource]);
  return (
    <div>
      <div>
        camera:{" "}
        <select onChange={(e) => setInputSource(e.target.value)}>
          {devices
            .filter((device) => device.kind === "videoinput")
            .map((device) => (
              <option value={device.deviceId}>{device.label}</option>
            ))}
        </select>{" "}
        detected: {detectedCode}
      </div>
      <div id="quagga"></div>
    </div>
  );
};
