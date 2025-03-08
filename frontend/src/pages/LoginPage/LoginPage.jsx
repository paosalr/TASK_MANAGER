import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', values);
      message.success('Ingreso exitoso');
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      message.error('Ingreso fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ color: '#4F2A42', textAlign: 'center' }}>Login</h1>
      <Form onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Invalid email format' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#4F2A42', borderColor: '#4F2A42', width: '100%' }}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;