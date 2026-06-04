import { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const saveUser = async () => {
    await axios.post("http://localhost:8000/users", {
      name,
      email,
    });

    alert("User saved!");
  };

  return (
    <div>
      <h1>Create User</h1>

      <input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <br />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <button onClick={saveUser}>
        Save
      </button>
    </div>
  );
}

export default App;