import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Collapse, Select, Divider, message } from 'antd';
import '../styles/global.css';
import axios from 'axios';

const { Panel } = Collapse;

const KanbanBoard = ({ tasks, onEdit, onDelete, userRole, userId, users }) => {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newTaskList = Array.from(tasks || []); 
    const [removed] = newTaskList.splice(source.index, 1);
    newTaskList.splice(destination.index, 0, removed);
  };

  const filteredTasks = (tasks || []).filter((task) => { // Asegurar que tasks sea un array
    if (userRole === 'employee') {
      if (task.taskType === 'individual' && task.userId === userId) {
        return true;
      }


      // Mostrar tareas grupales donde el empleado fue asignado en alguna subtarea
      if (task.taskType === 'grupal' && (task.subtasks || []).some((subtask) => subtask.assignedTo === userId)) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}
          className="kanban-board">
                {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      backgroundColor: '#fff',
                      ...provided.draggableProps.style,
                    }}
                  >
                    <h3>{task.name}</h3>
                    <p> Status:{' '}
                    <span className={`status-${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                    </span>
                    </p>
                    <p>Fecha de finalización: {task.timeUntilFinish}</p>
                    <p>Descripcion: {task.description}</p>
                    <p>Tipo de tarea: {task.taskType}</p>
                    {task.taskType === 'grupal' && (
  <Collapse>
    <Panel header="Subtareas" key="1">
      {(task.subtasks || []).map((subtask, idx) => ( 
        <div key={idx}>
          <p><strong>Empleado:</strong> {users.find((user) => user.id === subtask.assignedTo)?.username}</p>
          <p><strong>Instrucción:</strong> {subtask.instruction}</p>
          <p>
            <strong>Estado:</strong>{' '}
            {subtask.assignedTo === userId ? ( 
              <Select
                defaultValue={subtask.status || 'In Progress'}
                onChange={async (value) => {
                try {
                  // Actualizar el estado de la subtarea en el frontend
                  const response = await axios.put(
                    `http://localhost:5000/api/tasks/${task.id}/update-subtask`,
                    {
                      subtaskId: subtask.id, 
                      newStatus: value, 
                    },
                    {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }
                  );
            
                  console.log("Respuesta del backend:", response.data); 
                        
                  // Actualizar el estado de la subtarea en el frontend
                  const updatedSubtasks = task.subtasks.map((st) =>
                    st.id === subtask.id ? { ...st, status: value } : st
                  );
                  const updatedTask = { ...task, subtasks: updatedSubtasks };
                  message.success("Estado de la subtarea actualizado exitosamente");
                } catch (error) {
                  console.error("Error al actualizar la subtarea:", error);
                  message.error("No se pudo actualizar el estado de la subtarea.");
                }
              }}
            >
              <Select.Option value="In Progress">En Progreso</Select.Option>
              <Select.Option value="Done">Terminado</Select.Option>
              <Select.Option value="Paused">Pausado</Select.Option>
              <Select.Option value="Revision">Revisión</Select.Option>
            </Select>
            ) : (
              subtask.status // Mostrar el estado sin opción de editar
            )}
          </p>
          <Divider />
              </div>
                  ))}
                  </Panel>
                    </Collapse>
                    )}    
                    <Space>
                    {userRole === 'employee' && task.taskType === 'individual' && task.userId === userId && (
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(task)}
                        className="button-link"
                      >
                        Editar
                      </Button>
                      )}
                      {(userRole === 'admin' || userRole === 'master') && (
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => onEdit(task)}
                          className="button-link"
                        >
                          Editar
                        </Button>
                      )}
                      {(userRole !== 'employee' || (userRole === 'employee' && task.taskType === 'individual')) && (
                      <Popconfirm
                        title="¿Estás seguro de eliminar esta tarea?"
                        onConfirm={() => onDelete(task.id)}
                        okText="Sí"
                        cancelText="No"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />} className="button-link-danger">
                          Eliminar
                        </Button>
                      </Popconfirm>
                        )}
                    </Space>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard;