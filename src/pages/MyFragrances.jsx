import { supabase } from "../lib/supabase";
import { useState, useEffect, use } from "react";

const MyFragrances = () => {
  const [fragrances, setFragrances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFragrances();
  }, []);

  async function fetchFragrances() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase.from("fragrances").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    if (!error) {
      setFragrances(data);
    }

    setLoading(false);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Fragrances</h1>

      {fragrances.length === 0 ? (
        <p>No fragrances added yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Added</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {fragrances.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.brand}</td>
                <td>{f.type}</td>
                <td>{f.notes}</td>
                <td>{new Date(f.created_at).toDateString()}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyFragrances;
