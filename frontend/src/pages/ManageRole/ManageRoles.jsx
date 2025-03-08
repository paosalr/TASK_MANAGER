import React, { useState, useEffect } from "react";
import { Table, Select, message } from "antd";
import axios from "axios";

const ManageRoles = () => {
    const [users, setUsers] = useState([]);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
        },
          });
          setUsers(response.data);
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
          message.error("No se pudieron cargar los usuarios.");
        }
      };
  
      fetchUsers();
    }, []);
  
    const handleRoleChange = async (userId, newRole) => {
      try {
        await axios.post("http://localhost:5000/api/auth/change-role", { userId, newRole }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        });
        message.success("Rol actualizado correctamente");
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      } catch (error) {
        console.error("Error al cambiar rol:", error);
        message.error("No se pudo cambiar el rol.");
      }
    };
  
    return (
      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "20px" }}>Gestionar Roles</h1>
        <Table 
          dataSource={users} 
          rowKey="id" 
          size="middle" 
          columns={[          
          { title: 'Nombre', dataIndex: 'username', key: 'username' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Rol Actual', dataIndex: 'role', key: 'role' },
          {  
            title: 'Cambiar Rol', 
              key: 'action', 
              width: 200,
              render: (_, record) => (
            <Select defaultValue={record.role} onChange={(value) => handleRoleChange(record.id, value)}
                    style={{width: "150px"}}>
              <Select.Option value="master">Master</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="employee">Employee</Select.Option>
            </Select>
          )},
        ]}
        pagination={{ pageSize: 10 }} 
        />
      </div>
    );
  };

  export default ManageRoles;