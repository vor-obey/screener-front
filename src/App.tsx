import { useEffect, useRef, useState } from "react";

import "./App.css";

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toFixed(2);
}
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [map, setMap] = useState<
    Record<
      string,
      {
        maxDensity: number;
        price: number;
        volume24h: number;
        priceChange: number;
        side: string;
        timesMore: number;
        largeVolume: boolean;
      }
    >
  >({});
  const checkboxRef = useRef<any>(null);
  const [isSorted, setIsSorted] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  const handleCheckboxChange = () => setIsSorted(checkboxRef.current.checked);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 60 * 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // const socket = new WebSocket("ws://localhost:3001");
    const socket = new WebSocket("wss://screener-back-1.onrender.com");
    socket.onopen = () => setIsConnected(true);

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setMap((prev) => ({
        ...prev,
        [data.symbol]: {
          maxDensity: formatNumber(data.maxDensity),
          price: data.price,
          volume24h: formatNumber(data.volume24h),
          priceChange: data.priceChange,
          side: data.side,
          timesMore: data.timesMore,
          largeVolume: data.volume24h > 100000000,
        },
      }));
    };

    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    return () => socket.close();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      if (e.clientY <= 50) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const sortedEntries = Object.entries(map).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB),
  );

  const entries = isSorted ? sortedEntries : Object.entries(map);

  return (
    <div className="root">
      <div
        className="navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "50px",
          backgroundColor: `rgba(70, 70, 70, ${Math.min(0.9, 1)})`,
          borderBottom: "1px solid #757575",
          boxShadow: "0px 16px 13px -7px rgba(34, 60, 80, 0.5)",
          color: "white",
          display: showNavbar ? "flex" : "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 1000,
          transition: "opacity 0.3s ease",
        }}
      >
        <label>
          <input
            type="checkbox"
            ref={checkboxRef}
            onChange={handleCheckboxChange}
            value="checked"
          />
          Alphabet sorting
        </label>
          <div className={`${isConnected ? 'status-active' : 'status-disconnect'}`}></div>
      </div>

      <div className="cell-container">
        {entries?.map(
          (
            [
              symbol,
              {
                maxDensity,
                price,
                volume24h,
                priceChange,
                side,
                timesMore,
                largeVolume,
              },
            ],
            i,
          ) => (
            <div
              key={symbol}
              className={`h-16 flex items-center justify-center text-xs font-bold text-white cell ${
                i === entries.length - 1 ? "lastCell" : ""
              } `}
              style={{
                background: timesMore > 4 ? "#bb00fa" : "",
              }}
              onClick={() =>
                window.open(
                  `https://digash.live/#/app/coins-view/BINANCE_FUTURES/${symbol}`,
                  "_blank",
                )
              }
            >
              <div className="cell-info-head">
                <span className="symbol">{symbol}</span>
                <span className={timesMore > 2 ? "hot" : ""}>x{timesMore}</span>
              </div>
              <div className="cell-info">
                <span className={side === "bid" ? "p-low" : "p-high"}>
                  DS: {maxDensity}
                </span>
                <span>P: {price}</span>
                <span className={largeVolume ? "large-volume" : ""}>
                  24V: {volume24h}
                </span>

                <span
                  className={`price-change ${
                    priceChange > 0 ? "p-high" : "p-low"
                  }`}
                >
                  {priceChange.toFixed(1)}%
                </span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default App;
