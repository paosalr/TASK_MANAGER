import React, { useState, useEffect } from "react";
import { Menu, Button, Modal, Form, Input, Select, message, DatePicker, Space, Divider, Radio } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { jwtDecode } from "jwt-decode";
import KanbanBoard from '../../components/KanbanBoard';
import { useNavigate } from "react-router-dom";
import GroupForm from '../../components/GroupForm';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [userRole, setUserRole] = useState("employee");
  const [users, setUsers] = useState([]);
  const [taskType, setTaskType] = useState("individual");
  const [userId, setUserId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      setUserId(decoded.userId);
    };

    fetchUserRole();
  }, []);

  // Función para cargar tareas del usuario actual
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (userRole === "employee") {
        // Filtrar tareas individuales creadas por el empleado
        const individualTasks = response.data.filter(
          (task) => task.taskType === "individual" && task.userId === userId
        );

        // Filtrar tareas grupales donde el empleado fue asignado en alguna subtarea
        const groupTasks = response.data.filter((task) => {
          if (task.taskType === "grupal") {
            return task.subtasks.some((subtask) => subtask.assignedTo === userId);
          }
          return false;
        });

        // Combinar tareas individuales y grupales
        setTasks([...individualTasks, ...groupTasks]);
      } else {
        // Si es admin o master, mostrar todas las tareas
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      message.error("No se pudieron cargar las tareas.");
    }
  };

  // Función para cargar grupos
  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/groups", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      message.error("No se pudieron cargar los grupos.");
    }
  };

  // Función para cargar usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      message.error("No se pudieron cargar los usuarios.");
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { assignedTo: null, instruction: "" }]);
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  // Cargar tareas, grupos y usuarios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      await fetchGroups();
      await fetchUsers();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!Array.isArray(response.data)) {
          throw new Error("Formato de datos inválido");
        }

        if (userRole === "employee" && userId) { // Verificar que userId esté disponible
          // Filtrar tareas individuales creadas por el empleado
          const individualTasks = response.data.filter(
            (task) => task.taskType === "individual" && task.userId === userId
          );
  
          // Filtrar tareas grupales donde el empleado fue asignado en alguna subtarea
          const groupTasks = response.data.filter((task) => {
            if (task.taskType === "grupal") {
              return task.subtasks?.some((subtask) => subtask.assignedTo === userId);
            }
            return false;
          });
  
          // Combinar tareas individuales y grupales
          setTasks([...individualTasks, ...groupTasks]);
        } else {
          // Si es admin o master, mostrar todas las tareas
          setTasks(response.data);
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error);
        message.error("No se pudieron cargar las tareas.");
      }
    };
  
    fetchTasks();
  }, [userRole, userId]);

  // Función para enviar una nueva tarea al backend
  const handleAddTask = async (values) => {
    try {
      if (taskType === 'grupal' && subtasks.length === 0) {
        message.error('Debes asignar al menos una subtarea');
        return;
      }
  
      // Crear un objeto de subtareas con empleados e instrucciones
      const subtasksWithData = subtasks.map((subtask) => ({
        assignedTo: subtask.assignedTo,
        instruction: subtask.instruction,
        status: subtask.status || 'In Progress',
      }));
      
      const taskData = {
        ...values,
        taskType: values.taskType,
        subtasks: taskType === 'grupal' ? subtasksWithData : [],
        groupId: values.groupId, // Incluir el ID del grupo seleccionado
      };

      await axios.post("http://localhost:5000/api/tasks", taskData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Tarea agregada exitosamente");
      setModalVisible(false);
      form.resetFields();
      setSubtasks([]);
      await fetchTasks();
    } catch (error) {
      console.error("Error al agregar tarea:", error);
      message.error("No se pudo agregar la tarea.");
    }
  };

  // Función para manejar la edición de una tarea
  const handleEdit = (task) => {
    {
    setCurrentTask(task); 
    setEditModalVisible(true); 
    editForm.setFieldsValue({
      ...task,
      timeUntilFinish: moment(task.timeUntilFinish), 
      assignedTo: task.assignedTo || [],
    });
  }
  };

  // Función para enviar la tarea editada al backend
  const handleEditTask = async (values) => {
    try {
      if (userRole === 'employee' && currentTask?.taskType === 'grupal') {
        // Solo actualizar el status de la subtarea asignada al empleado
        const updatedSubtasks = currentTask.subtasks.map(subtask => 
          subtask.assignedTo === userId ? { ...subtask, status: values.status } : subtask
        );
        
        await axios.put(
          `http://localhost:5000/api/tasks/${currentTask.id}/update-subtask`,
          {
            subtaskId: currentTask.subtasks.find(st => st.assignedTo === userId)?.id,
            
            newStatus: values.status
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        
        // Actualizar el estado local
        const updatedTask = { ...currentTask, subtasks: updatedSubtasks };
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
        // Para admin/master o tareas individuales de empleado
        await axios.put(
          `http://localhost:5000/api/tasks/${currentTask.id}`,
          values,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }
      
      message.success("Tarea actualizada exitosamente");
      setEditModalVisible(false);
      await fetchTasks(); 
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      message.error("No se pudo actualizar la tarea.");
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Tarea eliminada exitosamente");
      await fetchTasks();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      message.error("No se pudo eliminar la tarea.");
    }
  };

  // Función para crear un nuevo grupo
  const handleCreateGroup = async (values) => {
    try {
      const response = await axios.post('http://localhost:5000/api/groups', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Grupo creado exitosamente');
      setGroupModalVisible(false);
      await fetchGroups();
      const newGroupId = response.data.id;
      form.setFieldsValue({ groupId: newGroupId });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      message.error('No se pudo crear el grupo.');
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Menú */}
      <Menu mode="horizontal"
      style={{ marginBottom: "20px" }}
      onClick={({ key }) => {
        if (key === "manage-roles") navigate("/manage-roles");
      }}
    >
        <Menu.Item key="dashboard">Dashboard</Menu.Item>
        {(userRole === "master") && (
          <Menu.Item key="manage-roles">Manage Roles</Menu.Item>
        )}
        <Menu.Item key="settings">Settings</Menu.Item>
        <Menu.Item key="help">Help</Menu.Item>
      </Menu>
      {/* Kanban Board */}
      <KanbanBoard tasks={tasks} onEdit={handleEdit} onDelete={handleDeleteTask} userRole={userRole} userId={userId} users={users}
      />
      {/* Botón para agregar tarea */}
      <Button
        type="primary"
        shape="circle"
        style={{
          position: 'fixed',
          bottom: '50px',
          right: '50px',
          width: '70px',
          height: '70px',
          fontSize: '42px',
          backgroundColor: '#4F2A42',
          borderColor: '#4F2A42',
          color: '#F5EDE6',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => setModalVisible(true)}
      >
        +
      </Button>

      {/* Modal para agregar tarea */}
      <Modal
  title="Nueva Tarea"
  visible={modalVisible}
  onCancel={() => {
    setModalVisible(false);
    setSubtasks([]); 
  }}
  footer={null}
>
  <Form form={form} layout="vertical" onFinish={handleAddTask}>
    {(userRole === "admin" || userRole === "master") && (
      <Form.Item
        name="taskType"
        label="Tipo de tarea"
        rules={[{ required: true, message: 'Por favor selecciona el tipo de tarea' }]}
      >
        <Radio.Group onChange={(e) => setTaskType(e.target.value)} value={taskType}>
          <Radio value="individual">Individual</Radio>
          <Radio value="grupal" disabled={userRole === 'employee'}>Grupal</Radio>
        </Radio.Group>
      </Form.Item>
    )}
    <Form.Item
      name="name"
      label="Nombre de la tarea"
      rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
    >
      <Input />
    </Form.Item>

    {taskType === 'grupal' && (userRole === "admin" || userRole === "master") && (
  <>
    {/* Campo para seleccionar un grupo existente */}
    <Form.Item
      name="groupId"
      label="Seleccionar grupo"
      rules={[{ required: true, message: 'Por favor selecciona un grupo' }]}
    >
      <Select placeholder="Selecciona un grupo" style={{ width: '100%' }}>
        {groups.map((group) => (
          <Select.Option key={group.id} value={group.id}>
            {group.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
      {/* Botón para crear un grupo */}
      <Form.Item label="Grupos">
      <Button
        type="dashed"
        onClick={() => setGroupModalVisible(true)}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        Agregar Grupo
      </Button>
    </Form.Item>
    </>
    )}
    <Form.Item
      name="description"
      label="Descripción"
      rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
    >
      <Input.TextArea />
    </Form.Item>
    {taskType === 'grupal' && (userRole === "admin" || userRole === "master") && (
      <Form.Item label="Subtareas">
        {subtasks.map((subtask, index) => (
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item
              name={['subtasks', index, 'assignedTo']}
              rules={[{ required: true, message: 'Selecciona un empleado' }]}
            >
              <Select
                placeholder="Selecciona un empleado"
                style={{ width: 200 }}
                onChange={(value) => {
                  const newSubtasks = [...subtasks];
                  newSubtasks[index].assignedTo = value;
                  setSubtasks(newSubtasks);
                }}
              >
                {users
                  .filter((user) => user.role === 'employee')
                  .map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.username}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name={['subtasks', index, 'instruction']}
              rules={[{ required: true, message: 'Ingresa una instrucción' }]}
            >
              <Input
                placeholder="Instrucción"
                onChange={(e) => {
                  const newSubtasks = [...subtasks];
                  newSubtasks[index].instruction = e.target.value;
                  setSubtasks(newSubtasks);
                }}
              />
            </Form.Item>
            <Button
              type="dashed"
              onClick={() => removeSubtask(index)}
              icon={<MinusOutlined />}
            >
              Eliminar
            </Button>
          </Space>
        ))}
        <Button type="dashed" onClick={addSubtask} icon={<PlusOutlined />}>
          Agregar Subtarea
        </Button>
      </Form.Item>
    )}
    <Form.Item
      name="category"
      label="Categoría"
      rules={[{ required: true, message: 'Por favor ingresa una categoría' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="timeUntilFinish"
      label="Fecha de finalización"
      rules={[{ required: true, message: 'Por favor selecciona una fecha' }]}
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item
      name="status"
      label="Status"
      rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
    >
      <Select>
        <Select.Option value="In Progress">En Progreso</Select.Option>
        <Select.Option value="Done">Terminado</Select.Option>
        <Select.Option value="Paused">Pausado</Select.Option>
        <Select.Option value="Revision">Revisión</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" block>
        Agregar Tarea
      </Button>
    </Form.Item>
    </Form>
    </Modal>

      {/* Submodal para crear un nuevo grupo */}
      {(userRole === "admin" || userRole === "master") && (
        <Modal
          title="Crear Nuevo Grupo"
          visible={groupModalVisible}
          onCancel={() => setGroupModalVisible(false)}
          footer={null}
        >
          <GroupForm onFinish={handleCreateGroup} />
        </Modal>
      )}
      
     
      {/* Modal para editar tarea */}
      <Modal
        title="Editar Tarea"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditTask}>
        {(userRole === 'admin' || userRole === 'master' || currentTask?.taskType === 'individual') && (
          <Form.Item
            name="name"
            label="Nombre de la tarea"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
          >
        <Input disabled={userRole === 'employee' && currentTask?.taskType === 'grupal'} />
        </Form.Item>
              )}
        {(userRole === 'admin' || userRole === 'master' || currentTask?.taskType === 'individual') && (
          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
          >
          <Input.TextArea disabled={userRole === 'employee' && currentTask?.taskType === 'grupal'} />
          </Form.Item>
            )}
        {(userRole === 'admin' || userRole === 'master' || currentTask?.taskType === 'individual') && (
          <Form.Item
            name="category"
            label="Categoría"
            rules={[{ required: true, message: 'Por favor ingresa una categoría' }]}
          >
          <Input.TextArea disabled={userRole === 'employee' && currentTask?.taskType === 'grupal'} />
          </Form.Item>
            )}
        {(userRole === 'admin' || userRole === 'master' || currentTask?.taskType === 'individual') && (
          <Form.Item
            name="timeUntilFinish"
            label="Fecha de finalización"
            rules={[{ required: true, message: 'Por favor selecciona una fecha' }]}
          >
          <DatePicker style={{ width: '100%' }} disabled={userRole === 'employee' && currentTask?.taskType === 'grupal'} />
          </Form.Item>
          )}
           {currentTask?.taskType === 'grupal' && (userRole === 'admin' || userRole === 'master') && (
          <Form.Item
            name="assignedTo"
            label="Asignar a"
            rules={[{ required: true, message: 'Por favor selecciona al menos un empleado' }]}
          >
          <Select mode="multiple">
          {users
            .filter((user) => user.role === 'employee')
            .map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
            ))}
          </Select>
          </Form.Item>
          )}
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
          >
            <Select>
              <Select.Option value="In Progress">En Progreso</Select.Option>
              <Select.Option value="Done">Terminado</Select.Option>
              <Select.Option value="Paused">Pausado</Select.Option>
              <Select.Option value="Revision">Revisión</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Actualizar Tarea
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPage;