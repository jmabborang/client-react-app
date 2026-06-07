import { useEffect, useMemo, useRef, useState } from 'react'
import Grid from '../../app/core/grid';
import ParameterInput from '../../app/core/parameter-input';
import '../../shared/styles/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    username: '',
    gender: '',
    department: '',
    position: '',
  });
  const applyFiltersTimeoutRef = useRef(null);

  useEffect(() => {
    fetch("https://dummyjson.com/users")
      .then((response) => response.json())
      .then((data) => {
        console.log('this is the data: ', data);
        setUsers(data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => () => {
    if (applyFiltersTimeoutRef.current) {
      window.clearTimeout(applyFiltersTimeoutRef.current);
    }
  }, []);

  const genderOptions = useMemo(() => {
    const uniqueGenders = [...new Set(users.map((user) => user?.gender).filter(Boolean))];

    return [
      { value: '', label: '(All)' },
      ...uniqueGenders.map((value) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
      })),
    ];
  }, [users]);

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(users.map((user) => user?.company?.department).filter(Boolean)),
    ];

    return [
      { value: '', label: '(All)' },
      ...uniqueDepartments.map((value) => ({ value, label: value })),
    ];
  }, [users]);

  const positionOptions = useMemo(() => {
    const uniquePositions = [
      ...new Set(users.map((user) => user?.company?.title).filter(Boolean)),
    ];

    return [
      { value: '', label: '(All)' },
      ...uniquePositions.map((value) => ({ value, label: value })),
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedUsername = appliedFilters.username.trim().toLowerCase();

    return users.filter((user) => {
      const matchesUsername =
        !normalizedUsername ||
        String(user?.username ?? '').toLowerCase().includes(normalizedUsername);
      const matchesGender = !appliedFilters.gender || user?.gender === appliedFilters.gender;
      const matchesDepartment =
        !appliedFilters.department || user?.company?.department === appliedFilters.department;
      const matchesPosition =
        !appliedFilters.position || user?.company?.title === appliedFilters.position;

      return matchesUsername && matchesGender && matchesDepartment && matchesPosition;
    });
  }, [users, appliedFilters]);

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);

    if (applyFiltersTimeoutRef.current) {
      window.clearTimeout(applyFiltersTimeoutRef.current);
    }

    applyFiltersTimeoutRef.current = window.setTimeout(() => {
      setAppliedFilters({
        username,
        gender,
        department,
        position,
      });
      setIsApplyingFilters(false);
      applyFiltersTimeoutRef.current = null;
    }, 200);
  };

  const handleReset = () => {
    setUsername('');
    setGender('');
    setDepartment('');
    setPosition('');
    setAppliedFilters({
      username: '',
      gender: '',
      department: '',
      position: '',
    });
  };
  
  return (
    <div className="dashboard-page">
      <section className="users-parameter-panel" aria-labelledby="users-parameters-title">
        <div className="users-parameter-bar users-parameter-bar-compact">
          <ParameterInput
            id="username-parameter"
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Please type username..."
            className="parameter-field-wide"
          />

          <ParameterInput
            id="gender-parameter"
            label="Gender"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            control="select"
            options={genderOptions}
          />

        </div>

        <div className="users-parameter-bar users-parameter-bar-compact">
          <ParameterInput
            id="department-parameter"
            label="Department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            control="select"
            options={departmentOptions}
          />

          <ParameterInput
            id="position-parameter"
            label="Position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            control="select"
            options={positionOptions}
          />

        </div>

        <div className="users-parameter-bar users-parameter-bar-compact">
          <button
            type="button"
            className="users-parameter-button users-parameter-button-reset"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="button"
            className="users-parameter-button"
            onClick={handleApplyFilters}
            disabled={isApplyingFilters}
          >
            {isApplyingFilters ? 'Applying...' : 'Go'}
          </button>
          
        </div>
      </section>

      <section
        aria-labelledby="users-table-title"
        className="dashboard-page-section"
      >
        <Grid
          fillHeight
          data={filteredUsers}
          loading={loading || isApplyingFilters}
          columns={[
            { field: 'id', header: 'Id', hide:true},
            { field: 'username', header: 'Username'},
            { field: 'firstName', header: 'First Name'},
            { field: 'lastName', header: 'Last Name'},
            { field: 'gender', header: 'Gender'},
            { field: 'email', header: 'Email'},
            { field: 'age', header: 'Age'},
          ]}
        />
      </section>
    </div>
  )
}

export default Users
