import { useState, useEffect } from 'react'
const userRows = [
  { name: 'John Doe', role: 'Administrator', status: 'Active' },
  { name: 'Maria Santos', role: 'Inventory Clerk', status: 'Active' },
  { name: 'Kevin Cruz', role: 'Warehouse Staff', status: 'Pending' },
  { name: 'Angela Reyes', role: 'Supervisor', status: 'Active' },
]

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://dummyjson.com/users")
      .then((response) => response.json())
      .then((data) => {
        console.log('this is the data: ', data);
        setUsers(data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);
  
  return (
    <div className="dashboard-page">
      <section className="dashboard-panel" aria-labelledby="users-table-title">
        <div className="dashboard-panel-header">
          <h3 id="users-table-title">User list</h3>
          <span>Latest records</span>
        </div>

        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Users
