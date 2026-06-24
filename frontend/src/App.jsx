import { useEffect, useState } from "react";

function App() {
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [waitingPatients, setWaitingPatients] = useState([]);

  const loadDashboard = async () => {
    try {
      const currentRes = await fetch(
        "http://localhost:5000/api/queue/current"
      );

      const waitingRes = await fetch(
        "http://localhost:5000/api/queue/waiting"
      );

      const currentData = await currentRes.json();
      const waitingData = await waitingRes.json();

      setCurrentToken(currentData.currentToken);
      setWaitingCount(waitingData.totalWaiting || 0);
      setWaitingPatients(waitingData.waitingPatients || []);

    } catch (error) {
      console.error(error);
    }
  };

  const callNext = async () => {
    try {
      await fetch("http://localhost:5000/api/queue/next", {
        method: "POST",
      });

      loadDashboard();

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>🏥 QueueCure AI Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            width: "250px",
          }}
        >
          <h2>Current Token</h2>

          <h1>
            {currentToken
              ? currentToken.tokenNumber
              : "No Active Token"}
          </h1>

          <p>
            Status:
            {" "}
            {currentToken
              ? currentToken.status
              : "-"}
          </p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            width: "250px",
          }}
        >
          <h2>Waiting Patients</h2>

          <h1>{waitingCount}</h1>
        </div>
      </div>

      <button
        onClick={callNext}
        style={{
          marginTop: "30px",
          padding: "15px 30px",
          border: "none",
          borderRadius: "10px",
          background: "#2563eb",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Call Next Patient
      </button>

      <div
        style={{
          marginTop: "40px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h2>Waiting Queue</h2>

        {waitingPatients.length === 0 ? (
          <p>No Patients Waiting</p>
        ) : (
          waitingPatients.map((item) => (
            <div
              key={item._id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #334155",
                marginBottom: "10px",
              }}
            >
              <strong>Token #{item.tokenNumber}</strong>

              <br />

              Patient:
              {" "}
              {item.patient?.fullName || "Unknown"}

              <br />

              Status:
              {" "}
              {item.status}

              <br />

              Wait Time:
              {" "}
              {item.estimatedWaitTime}
              {" "}
              mins
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;