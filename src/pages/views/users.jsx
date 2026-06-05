import { useState, useEffect } from 'react'
import Grid from '../../app/core/grid';

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
      <section aria-labelledby="users-table-title">
        <div className="dashboard-panel-header">
          <h3 id="users-table-title">User list</h3>
          <span>Latest records</span>
        </div>

        <Grid
          columns={[
            { field: 'id', header: 'Id', hide:true},
            { field: 'username', header: 'Username'},
            { field: 'firstName', header: 'First Name'},
            { field: 'lastName', header: 'Last Name'},
            { field: 'gender', header: 'Gender'},
            { field: 'email', header: 'Email'},
            { field: 'age', header: 'Age'},
          ]}
          data={users}
        />
      </section>
    </div>
  )
}

export default Users
