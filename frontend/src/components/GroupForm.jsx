import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';

const GroupForm = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        message.error('No se pudieron cargar los usuarios.');
      }
    };

    fetchUsers();
  }, []);

  const handleFinish = async (values) => {
    try {
      const groupData = {
        ...values,
        members: selectedEmployees,
      };
      await onFinish(groupData);

    // Limpiar el formulario
    form.resetFields();
    setSelectedEmployees([]);
    message.success('Grupo creado exitosamente');
    } catch (error) {
    console.error('Error al crear el grupo:', error);
    message.error('Error al crear el grupo');
    }
    };


  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item 
      name="name" 
      label="Nombre del grupo" 
      rules={[{ required: true, message: 'Por favor ingresa el nombre del grupo' }]}
      >
        <Input placeholder="Nombre del grupo" />
      </Form.Item>

      {/* Descripción del grupo */}
      <Form.Item
        name="description"
        label="Descripción"
        rules={[{ required: false }]}
      >
        <Input.TextArea placeholder="Descripción del grupo" />
      </Form.Item>

      {/* Asignar empleados al grupo */}
      <Form.Item
        label="Asignar empleados"
        rules={[{ required: true, message: 'Por favor selecciona al menos un empleado' }]}
      >
        <Select
          mode="multiple" // Permitir selección múltiple
          placeholder="Selecciona empleados"
          value={selectedEmployees}
          onChange={(values) => setSelectedEmployees(values)} // Actualizar empleados seleccionados
          style={{ width: '100%' }}
        >
          {users
            .filter((user) => user.role === 'employee') // Filtrar solo empleados
            .map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>

      {/* Botón para crear el grupo */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Crear Grupo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default GroupForm;