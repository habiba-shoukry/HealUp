import React, { useState } from "react";
import "../styles/PatientDetail.css";

const initialPatients = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    age: 34,
    gender: "Male",
    email: "john.doe@email.com",
    phone: "+971501234567",
    bloodType: "A+",
    condition: "Hypertension",
    risk: "high",
    lastVisit: "Apr 07, 2026",
    notes: "Patient shows elevated BP. Needs monitoring."
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    age: 28,
    gender: "Female",
    email: "jane.smith@email.com",
    phone: "+971559876543",
    bloodType: "O-",
    condition: "Anxiety Disorder",
    risk: "stable",
    lastVisit: "Apr 03, 2026",
    notes: "Responding well to therapy."
  },
  {
    id: "3",
    firstName: "Marcus",
    lastName: "Lee",
    age: 45,
    gender: "Male",
    email: "marcus.lee@email.com",
    phone: "+971501112233",
    bloodType: "B+",
    condition: "Chronic Stress / Insomnia",
    risk: "critical",
    lastVisit: "Apr 04, 2026",
    notes: "Severe sleep deprivation. Immediate attention required."
  },
  {
    id: "4",
    firstName: "Aisha",
    lastName: "Patel",
    age: 31,
    gender: "Female",
    email: "aisha.patel@email.com",
    phone: "+971502223344",
    bloodType: "AB+",
    condition: "Routine Monitoring",
    risk: "stable",
    lastVisit: "Apr 15, 2026",
    notes: "No major concerns."
  }
];

export default function PatientDetail() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // FILTER + SEARCH
  const filteredPatients = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) &&
      (filter === "all" || p.risk === filter)
    );
  });

  // VIEW
  const handleView = (patient) => setSelectedPatient(patient);

  // EDIT
  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setNewNote(patient.notes);
  };

  const saveNote = () => {
    setPatients(prev =>
      prev.map(p =>
        p.id === editingPatient.id ? { ...p, notes: newNote } : p
      )
    );
    setEditingPatient(null);
  };

  // ALERT
  const handleAlert = (patient) => {
    setAlertMsg(`${patient.firstName} has been alerted`);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  return (
    <div className="patient-page">
      <div className="content-wrapper">

        <h1 className="page-title">Patient Records</h1>

        {/* CONTROLS */}
        <div className="patients-controls">
          <input
            placeholder="Search patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="select-wrapper">
            <select onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        <div className="patient-list">
          {filteredPatients.map((p) => (
            <div className="patient-card" key={p.id}>

              <div className={`priority-bar ${p.risk}`}></div>

              <div className="patient-header">
                <div>
                  <h2>{p.firstName} {p.lastName}</h2>
                  <p className="patient-meta">
                    {p.age} • {p.gender} • {p.bloodType}
                  </p>
                </div>

                <span className={`risk-badge ${p.risk}`}>
                  {p.risk.toUpperCase()}
                </span>
              </div>

              <div className="section">
                <h3>
                  <img src="/medical-card.png" alt="Medical" className="section-icon" />
                  Medical
                </h3>
                <p><strong>Condition:</strong> {p.condition}</p>
                <p><strong>Last Visit:</strong> {p.lastVisit}</p>
              </div>

              <div className="section">
                <h3>
                  <img src="/health-insurance.png" alt="Notes" className="section-icon" />
                  Notes
                </h3>
                <p className="notes">{p.notes}</p>
              </div>

              <div className="patient-actions">
                <button onClick={() => handleView(p)}>View</button>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button className="alert-btn" onClick={() => handleAlert(p)}>
                  Alert
                </button>
              </div>

            </div>
          ))}
        </div>

        {selectedPatient && (
          <div className="modal-overlay">
            <div className="modal-card">

              <div className="modal-header">
                <div>
                  <h2>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <p className="modal-meta">
                    {selectedPatient.age} • {selectedPatient.gender} • {selectedPatient.bloodType}
                  </p>
                </div>

                <span className={`risk-badge ${selectedPatient.risk}`}>
                  {selectedPatient.risk.toUpperCase()}
                </span>
              </div>

              <div className="modal-section">
                <h3>
                  <img src="/user-account.png" alt="Personal Information" className="section-icon" />
                  Personal Information
                </h3>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              </div>

              <div className="modal-section">
                <h3>
                  <img src="/medical-card.png" alt="Medical Details" className="section-icon" />
                  Medical Details
                </h3>
                <p><strong>Condition:</strong> {selectedPatient.condition}</p>
                <p><strong>Last Visit:</strong> {selectedPatient.lastVisit}</p>
              </div>

              <div className="modal-section">
                <h3>
                  <img src="/health-insurance.png" alt="Doctor Notes" className="section-icon" />
                  Doctor Notes
                </h3>
                <p className="notes">{selectedPatient.notes}</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>

            </div>
          </div>
        )}

        {editingPatient && (
          <div className="modal-overlay">
            <div className="modal-card">

              <div className="modal-header">
                <h2>
                  Edit Note to {editingPatient.firstName}
                </h2>
              </div>

              <div className="modal-section">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="edit-textarea"
                />
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={saveNote}>
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setEditingPatient(null)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ALERT */}
        {alertMsg && (
          <div className="alert-popup">
            <img src="/alert.png" alt="Alert" className="alert-icon" />
            {alertMsg}
          </div>
        )}

      </div>
    </div>
  );
}