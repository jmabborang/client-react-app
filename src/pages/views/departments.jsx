import React from "react";
import Grid from '../../app/core/grid';
import { useEffect } from "react";
import { httpClient } from "../../shared/api/httpClient";

function Departments() {
  const [departments, setDepartments] = React.useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await httpClient.get("/departments/list");
        console.log("Departments API data:", response?.data ?? response);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <>
      <section
        aria-labelledby="departments-table-title"
        className="dashboard-page-section"
      >
        <Grid
          forms={'forms/departments'}
          fillHeight
          data={departments}
          loading={false}
          columns={[
            { field: "id", header: "Id", hide: true },
            { field: "Code", header: "Code" },
            { field: "Name", header: "Name" },
            { field: "Active", header: "Active", type: "boolean" },
          ]}
        />
      </section>
    </>
  );
}

export default Departments;
