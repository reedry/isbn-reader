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
    const width = window.screen.width;
    const quaggaWidth = width < 640 ? width : 640;
    Quagga.init(
      {
        locate: true,
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.getElementById("quagga") as Element,
          constraints: {
            width: quaggaWidth,
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
        Quagga.canvas.dom.overlay.setAttribute(
          "style",
          `margin-left: -${quaggaWidth}px`
        );
      }
    );
    Quagga.onDetected((data) => {
      console.log(data.codeResult.code);
      setDetectedCode(data.codeResult.code);
    });
    Quagga.onProcessed((result) => {
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;
      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute("width") as string),
            parseInt(drawingCanvas.getAttribute("height") as string)
          );
          result.boxes
            .filter(function (box) {
              return box !== result.box;
            })
            .forEach(function (box) {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: "green",
                lineWidth: 2,
              });
            });
        }
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2,
          });
        }
        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: "x", y: "y" },
            drawingCtx,
            { color: "red", lineWidth: 3 }
          );
        }
      }
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
