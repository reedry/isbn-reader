import Quagga from "@ericblade/quagga2";

Quagga.init(
  {
    locate: true,
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.getElementById("scanner") as Element,
    },
    decoder: {
      readers: ["ean_reader"],
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
